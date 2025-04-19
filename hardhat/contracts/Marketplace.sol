// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AdvancedERC1155.sol";

contract ERC1155Marketplace is ERC1155Holder, Ownable, ReentrancyGuard {
    uint256 public listingCounter;
    uint256 public auctionCounter;
    uint256 public feePercentage = 20;
    address public feeRecipient;

    struct Listing {
        uint256 listingId;
        address seller;
        address tokenAddress;
        uint256 tokenId;
        uint256 amount;
        uint256 remaining;
        uint256 pricePerItem;
        bool isActive;
    }

    struct Auction {
        uint256 auctionId;
        address seller;
        address tokenAddress;
        uint256 tokenId;
        uint256 amount;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool finalized;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(address => uint256) public pendingWithdrawals;

    event NFTListed(
        uint256 indexed listingId,
        address indexed seller,
        address tokenAddress,
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerItem
    );

    event NFTSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice
    );

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address tokenAddress,
        uint256 tokenId,
        uint256 amount,
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

    constructor(address initialFeeRecipient) Ownable(msg.sender) {
        feeRecipient = initialFeeRecipient;
    }

    // ================== Fee Management ================== //

    function setFeePercentage(uint256 newFee) external onlyOwner {
        require(newFee <= 25, "Fee cannot exceed 25%");
        feePercentage = newFee;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
    }

    // ================== Fixed Price Functions ================== //

    function listItem(
        address tokenAddress,
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerItem
    ) external nonReentrant {
        AdvancedERC1155 tokenContract = AdvancedERC1155(tokenAddress);

        require(amount > 0, "ERC1155Marketplace: Amount must be > 0");
        require(pricePerItem > 0, "ERC1155Marketplace: Price must be > 0");
        try
            tokenContract.safeTransferFrom(
                msg.sender,
                address(this),
                tokenId,
                amount,
                ""
            )
        {
            listingCounter++;
            listings[tokenId] = Listing({
                listingId: listingCounter,
                seller: msg.sender,
                tokenAddress: tokenAddress,
                tokenId: tokenId,
                amount: amount,
                remaining: amount,
                pricePerItem: pricePerItem,
                isActive: true
            });

            emit NFTListed(
                listingCounter,
                msg.sender,
                tokenAddress,
                tokenId,
                amount,
                pricePerItem
            );
        } catch Error(string memory reason) {
            revert(
                string(
                    abi.encodePacked(
                        "ERC1155Marketplace: Transfer failed - ",
                        reason
                    )
                )
            );
        } catch {
            revert(
                "ERC1155Marketplace: Token transfer failed. Check balance and approval."
            );
        }
    }

    function buyItem(uint256 tokenId, uint256 amount)
        external
        payable
        nonReentrant
    {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Listing inactive");
        require(amount <= listing.remaining, "Insufficient quantity");

        AdvancedERC1155 tokenContract = AdvancedERC1155(listing.tokenAddress);

        uint256 totalPrice = amount * listing.pricePerItem;
        require(msg.value >= totalPrice, "Insufficient funds");

        uint256 feeAmount = (totalPrice * feePercentage) / 100;
        (address royaltyReceiver, uint256 royaltyAmount) = _getRoyaltyInfo(
            listing.tokenAddress,
            listing.tokenId,
            totalPrice
        );

        require(
            totalPrice >= feeAmount + royaltyAmount,
            "Invalid fee calculation"
        );

        listing.remaining -= amount;
        if (listing.remaining == 0) {
            listing.isActive = false;
        }

        tokenContract.safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId,
            amount,
            ""
        );

        pendingWithdrawals[listing.seller] +=
            totalPrice -
            feeAmount -
            royaltyAmount;
        pendingWithdrawals[royaltyReceiver] += royaltyAmount;
        pendingWithdrawals[feeRecipient] += feeAmount;

        if (msg.value > totalPrice) {
            (bool sent, ) = msg.sender.call{value: msg.value - totalPrice}("");
            require(sent, "Refund failed");
        }

        emit NFTSold(tokenId, msg.sender, amount, totalPrice);
    }

    // ================== Auction Functions ================== //

    function createAuction(
        address tokenAddress,
        uint256 tokenId,
        uint256 amount,
        uint256 startingPrice,
        uint256 duration
    ) external nonReentrant {
        AdvancedERC1155 tokenContract = AdvancedERC1155(tokenAddress);
        require(duration > 0, "Invalid duration");
        require(amount > 0, "Invalid amount");

        tokenContract.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            amount,
            ""
        );

        auctionCounter++;
        auctions[auctionCounter] = Auction({
            auctionId: auctionCounter,
            seller: msg.sender,
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            amount: amount,
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
            amount,
            startingPrice,
            duration
        );
    }

    function finalizeAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp >= auction.endTime, "Auction ongoing");
        require(!auction.finalized, "Already finalized");

        auction.finalized = true;
        AdvancedERC1155 tokenContract = AdvancedERC1155(auction.tokenAddress);

        if (auction.highestBidder != address(0)) {
            uint256 totalPrice = auction.highestBid;
            uint256 feeAmount = (totalPrice * feePercentage) / 100;
            (address royaltyReceiver, uint256 royaltyAmount) = _getRoyaltyInfo(
                auction.tokenAddress,
                auction.tokenId,
                totalPrice
            );

            require(
                totalPrice >= feeAmount + royaltyAmount,
                "Invalid fee calculation"
            );
            uint256 sellerAmount = totalPrice - feeAmount - royaltyAmount;

            tokenContract.safeTransferFrom(
                address(this),
                auction.highestBidder,
                auction.tokenId,
                auction.amount,
                ""
            );

            pendingWithdrawals[auction.seller] += sellerAmount;
            pendingWithdrawals[royaltyReceiver] += royaltyAmount;
            pendingWithdrawals[feeRecipient] += feeAmount;

            emit AuctionFinalized(auctionId, auction.highestBidder, totalPrice);
        } else {
            tokenContract.safeTransferFrom(
                address(this),
                auction.seller,
                auction.tokenId,
                auction.amount,
                ""
            );
        }
    }

    function placeBid(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];

        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");
        require(msg.value >= auction.startingPrice, "Below starting price");

        if (auction.highestBidder != address(0)) {
            pendingWithdrawals[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit NewBid(auctionId, msg.sender, msg.value);
    }

    // ================== Batch Functions ================== //

    function batchBuy(uint256[] calldata listingIds, uint256[] calldata amounts)
        external
        payable
        nonReentrant
    {
        require(listingIds.length == amounts.length, "Array length mismatch");

        uint256 totalPrice;

        for (uint256 i = 0; i < listingIds.length; i++) {
            Listing storage listing = listings[listingIds[i]];
            require(listing.isActive, "Listing inactive");
            require(amounts[i] > 0, "Zero amount");
            require(amounts[i] <= listing.remaining, "Exceeds available");

            totalPrice += listing.pricePerItem * amounts[i];
        }

        require(msg.value >= totalPrice, "Insufficient funds");

        for (uint256 i = 0; i < listingIds.length; i++) {
            uint256 listingId = listingIds[i];
            Listing storage listing = listings[listingId];
            uint256 amount = amounts[i];
            uint256 itemPrice = listing.pricePerItem * amount;

            listing.remaining -= amount;
            if (listing.remaining == 0) {
                listing.isActive = false;
            }

            AdvancedERC1155(listing.tokenAddress).safeTransferFrom(
                address(this),
                msg.sender,
                listing.tokenId,
                amount,
                ""
            );

            (address royaltyReceiver, uint256 royaltyAmount) = _getRoyaltyInfo(
                listing.tokenAddress,
                listing.tokenId,
                itemPrice
            );

            uint256 feeAmount = (itemPrice * feePercentage) / 100;
            uint256 sellerAmount = itemPrice - feeAmount - royaltyAmount;

            pendingWithdrawals[listing.seller] += sellerAmount;
            pendingWithdrawals[royaltyReceiver] += royaltyAmount;
            pendingWithdrawals[feeRecipient] += feeAmount;
        }

        if (msg.value > totalPrice) {
            (bool sent, ) = msg.sender.call{value: msg.value - totalPrice}("");
            require(sent, "Refund failed");
        }
    }

    // ================== Utility Functions ================== //

    function withdrawFunds() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds available");
        pendingWithdrawals[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function _getRoyaltyInfo(
        address tokenAddress,
        uint256 tokenId,
        uint256 salePrice
    ) internal view returns (address, uint256) {
        try IERC2981(tokenAddress).royaltyInfo(tokenId, salePrice) returns (
            address receiver,
            uint256 amount
        ) {
            return (receiver, amount);
        } catch {
            return (address(0), 0);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Holder)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getListing(uint256 listingId)
        public
        view
        returns (
            uint256 listingId_,
            address seller,
            address tokenAddress,
            uint256 tokenId,
            uint256 amount,
            uint256 remaining,
            uint256 pricePerItem,
            bool isActive
        )
    {
        require(
            listingId > 0 && listingId <= listingCounter,
            "Invalid listing ID"
        );
        Listing storage listing = listings[listingId];

        return (
            listing.listingId,
            listing.seller,
            listing.tokenAddress,
            listing.tokenId,
            listing.amount,
            listing.remaining,
            listing.pricePerItem,
            listing.isActive
        );
    }
}
