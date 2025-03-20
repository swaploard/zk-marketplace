// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarketplace is ReentrancyGuard {
    uint256 public listingCounter;
    uint256 public auctionCounter;

    /// @notice Structure for a fixed-price listing.
    struct Listing {
        uint256 listingId;
        address seller;
        address tokenAddress;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    /// @notice Structure for an auction.
    struct Auction {
        uint256 auctionId;
        address seller;
        address tokenAddress;
        uint256 tokenId;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool finalized;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;

    event NFTListed(
        uint256 indexed listingId,
        address indexed seller,
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    );
    event NFTSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price
    );
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address tokenAddress,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    );
    event NewBid(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 bidAmount
    );
    event AuctionFinalized(
        uint256 indexed auctionId,
        address winner,
        uint256 finalPrice
    );

    // ******************
    // Fixed-Price Sales
    // ******************

    /// @notice List an NFT for fixed-price sale.
    /// @dev Seller must approve the marketplace for NFT transfer.
    function listItem(
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be > 0");

        // Transfer NFT from seller to marketplace contract.
        IERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);

        listingCounter++;
        listings[listingCounter] = Listing({
            listingId: listingCounter,
            seller: msg.sender,
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            price: price,
            isActive: true
        });

        emit NFTListed(
            listingCounter,
            msg.sender,
            tokenAddress,
            tokenId,
            price
        );
    }

    /// @notice Buy a listed NFT.
    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient funds");

        listing.isActive = false;
        uint256 salePrice = listing.price;

        // Retrieve royalty information via EIP-2981 if available.
        (address royaltyReceiver, uint256 royaltyAmount) = _getRoyaltyInfo(
            listing.tokenAddress,
            listing.tokenId,
            salePrice
        );
        uint256 sellerAmount = salePrice - royaltyAmount;

        // Transfer NFT to buyer.
        IERC721(listing.tokenAddress).transferFrom(
            address(this),
            msg.sender,
            listing.tokenId
        );

        // Payout to seller using low-level call.
        {
            (bool successSeller, ) = (payable(listing.seller).call{value: sellerAmount}(""));
            require(successSeller, "Transfer to seller failed");
        }

        // Payout royalty if applicable.
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (bool successRoyalty, ) = (payable(royaltyReceiver).call{value: royaltyAmount}(""));
            require(successRoyalty, "Royalty transfer failed");
        }

        // Refund any excess funds.
        if (msg.value > salePrice) {
            (bool successRefund, ) = (payable(msg.sender).call{value: msg.value - salePrice}(""));
            require(successRefund, "Refund failed");
        }

        emit NFTSold(listingId, msg.sender, salePrice);
    }

    /// @notice Batch buy multiple listings in one transaction.
    function batchBuy(
        uint256[] calldata listingIds
    ) external payable nonReentrant {
        uint256 totalPrice = 0;

        // Calculate total cost.
        for (uint256 i = 0; i < listingIds.length; i++) {
            Listing storage listing = listings[listingIds[i]];
            require(listing.isActive, "One of the listings is not active");
            totalPrice += listing.price;
        }

        require(
            msg.value >= totalPrice,
            "Insufficient funds for batch purchase"
        );

        // Process each listing.
        for (uint256 i = 0; i < listingIds.length; i++) {
            Listing storage listing = listings[listingIds[i]];
            listing.isActive = false;
            uint256 salePrice = listing.price;

            (address royaltyReceiver, uint256 royaltyAmount) = _getRoyaltyInfo(
                listing.tokenAddress,
                listing.tokenId,
                salePrice
            );
            uint256 sellerAmount = salePrice - royaltyAmount;

            // Transfer NFT to buyer.
            IERC721(listing.tokenAddress).transferFrom(
                address(this),
                msg.sender,
                listing.tokenId
            );

            // Payout to seller.
            {
                (bool successSeller, ) = (payable(listing.seller).call{value: sellerAmount}(""));
                require(successSeller, "Transfer to seller failed");
            }

            // Payout royalty if applicable.
            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                (bool successRoyalty, ) = (payable(royaltyReceiver).call{value: royaltyAmount}(""));
                require(successRoyalty, "Royalty transfer failed");
            }

            emit NFTSold(listingIds[i], msg.sender, salePrice);
        }

        // Refund any excess funds.
        if (msg.value > totalPrice) {
            (bool successRefund, ) = (payable(msg.sender).call{value: msg.value - totalPrice}(""));
            require(successRefund, "Refund failed");
        }
    }

    // ******************
    // Auction Sales
    // ******************

    /// @notice Create an auction for an NFT.
    /// @param duration Duration of the auction in seconds.
    function createAuction(
        address tokenAddress,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    ) external nonReentrant {
        require(duration > 0, "Duration must be > 0");
        // Transfer NFT to marketplace.
        IERC721(tokenAddress).transferFrom(msg.sender, address(this), tokenId);

        auctionCounter++;
        auctions[auctionCounter] = Auction({
            auctionId: auctionCounter,
            seller: msg.sender,
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            startingPrice: startingPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            finalized: false
        });

        emit AuctionCreated(
            auctionCounter,
            msg.sender,
            tokenAddress,
            tokenId,
            startingPrice,
            duration
        );
    }

    /// @notice Place a bid on an auction.
    function bid(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp < auction.endTime, "Auction ended");

        // Determine minimum acceptable bid.
        uint256 minBid = auction.highestBid > 0
            ? auction.highestBid
            : auction.startingPrice;
        require(msg.value > minBid, "Bid not high enough");

        // Refund previous highest bidder, if any.
        if (auction.highestBidder != address(0)) {
            (bool successRefund, ) = (payable(auction.highestBidder).call{value: auction.highestBid}(""));
            require(successRefund, "Refund to previous bidder failed");
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit NewBid(auctionId, msg.sender, msg.value);
    }

    /// @notice Finalize an auction after it ends.
    function finalizeAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.finalized, "Auction already finalized");
        auction.finalized = true;

        // If there was at least one bid...
        if (auction.highestBidder != address(0)) {
            uint256 salePrice = auction.highestBid;
            (address royaltyReceiver, uint256 royaltyAmount) = _getRoyaltyInfo(
                auction.tokenAddress,
                auction.tokenId,
                salePrice
            );
            uint256 sellerAmount = salePrice - royaltyAmount;

            // Transfer NFT to highest bidder.
            IERC721(auction.tokenAddress).transferFrom(
                address(this),
                auction.highestBidder,
                auction.tokenId
            );

            // Payout to seller.
            {
                (bool successSeller, ) = (payable(auction.seller).call{value: sellerAmount}(""));
                require(successSeller, "Transfer to seller failed");
            }

            // Payout royalty if applicable.
            if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
                (bool successRoyalty, ) = (payable(royaltyReceiver).call{value: royaltyAmount}(""));
                require(successRoyalty, "Royalty transfer failed");
            }

            emit AuctionFinalized(auctionId, auction.highestBidder, salePrice);
        } else {
            // No bids: return NFT to seller.
            IERC721(auction.tokenAddress).transferFrom(
                address(this),
                auction.seller,
                auction.tokenId
            );
        }
    }

    // ******************
    // Internal Functions
    // ******************

    /// @notice Retrieve royalty information from the NFT contract if supported.
    function _getRoyaltyInfo(
        address tokenAddress,
        uint256 tokenId,
        uint256 salePrice
    ) internal returns (address royaltyReceiver, uint256 royaltyAmount) {
        // Use try/catch in case the NFT does not implement EIP-2981.
        try IERC2981(tokenAddress).royaltyInfo(tokenId, salePrice) returns (
            address receiver,
            uint256 amount
        ) {
            return (receiver, amount);
        } catch {
            return (address(0), 0);
        }
    }
}
