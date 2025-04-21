// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/AdvancedERC1155.sol";
import "../src/Marketplace.sol";

contract MarketplaceTest is Test {
    AdvancedERC1155 public nft;
    ERC1155Marketplace public marketplace;

    address public admin = vm.addr(1);
    address public seller = vm.addr(2);
    address public buyer = vm.addr(3);
    address public bidder1 = vm.addr(4);
    address public bidder2 = vm.addr(5);
    address public feeRecipient = vm.addr(7);
    address public royaltyReceiver = admin;

    uint256 public constant TOKEN_ID = 1;
    uint256 public constant MINT_AMOUNT = 10;
    uint256 public constant LIST_PRICE = 1 ether;
    uint256 public constant STARTING_PRICE = 1 ether;
    uint256 public constant BID_AMOUNT = 1.5 ether;

    function setUp() public {
        vm.startPrank(admin);
        marketplace = new ERC1155Marketplace(feeRecipient);

        nft = new AdvancedERC1155(
            "TestNFT",
            "TNFT",
            "ipfs://",
            "contract-uri",
            royaltyReceiver,
            1000,
            address(marketplace)
        );

        nft.mint(seller, MINT_AMOUNT, "cid1", "");
        nft.mint(seller, MINT_AMOUNT, "cid2", "");
        vm.stopPrank();

        vm.prank(seller);
        nft.setApprovalForAll(address(marketplace), true);
    }

    function test_listItem() public {
        vm.prank(seller);
        marketplace.listItem(address(nft), TOKEN_ID, MINT_AMOUNT, LIST_PRICE);

        // Use the getListing function
        (
            uint256 listingId,
            address sellerAddr,
            address tokenAddr,
            uint256 tokenId,
            uint256 amount,
            uint256 remaining,
            uint256 price,
            bool active
        ) = marketplace.getListing(1);

        assertEq(sellerAddr, seller);
        assertEq(remaining, MINT_AMOUNT);
        assertEq(price, LIST_PRICE);
        assertTrue(active);
    }

    function test_buyItem() public {
        vm.prank(seller);
        marketplace.listItem(address(nft), TOKEN_ID, MINT_AMOUNT, LIST_PRICE);

        uint256 buyAmount = 5;
        uint256 totalPrice = buyAmount * LIST_PRICE;
        vm.deal(buyer, totalPrice);

        vm.prank(buyer);
        marketplace.buyItem{value: totalPrice}(TOKEN_ID, buyAmount);

        assertEq(nft.balanceOf(buyer, TOKEN_ID), buyAmount);
        assertEq(
            nft.balanceOf(address(marketplace), TOKEN_ID),
            MINT_AMOUNT - buyAmount
        );

        uint256 feeAmount = (totalPrice * marketplace.feePercentage()) / 100;
        uint256 royaltyAmount = (totalPrice * 10) / 100;
        uint256 sellerAmount = totalPrice - feeAmount - royaltyAmount;
        assertEq(marketplace.pendingWithdrawals(seller), sellerAmount);
        assertEq(
            marketplace.pendingWithdrawals(royaltyReceiver),
            royaltyAmount
        );
        assertEq(marketplace.pendingWithdrawals(feeRecipient), feeAmount);
    }

    function test_createAndFinalizeAuction() public {
        vm.prank(seller);
        marketplace.createAuction(
            address(nft),
            TOKEN_ID,
            MINT_AMOUNT,
            STARTING_PRICE,
            1 days
        );

        vm.deal(bidder1, BID_AMOUNT);
        vm.prank(bidder1);
        marketplace.placeBid{value: BID_AMOUNT}(1);

        vm.deal(bidder2, BID_AMOUNT + 0.1 ether);
        vm.prank(bidder2);
        marketplace.placeBid{value: BID_AMOUNT + 0.1 ether}(1);

        vm.warp(block.timestamp + 2 days);

        vm.prank(admin);
        marketplace.finalizeAuction(1);

        assertEq(nft.balanceOf(bidder2, TOKEN_ID), MINT_AMOUNT);

        uint256 totalPrice = BID_AMOUNT + 0.1 ether;
        uint256 feeAmount = (totalPrice * marketplace.feePercentage()) / 100;
        uint256 royaltyAmount = (totalPrice * 10) / 100;
        uint256 sellerAmount = totalPrice - feeAmount - royaltyAmount;

        assertEq(marketplace.pendingWithdrawals(seller), sellerAmount);
        assertEq(
            marketplace.pendingWithdrawals(royaltyReceiver),
            royaltyAmount
        );
        assertEq(marketplace.pendingWithdrawals(feeRecipient), feeAmount);
    }

    function test_setFeeParameters() public {
        vm.prank(admin);
        marketplace.setFeePercentage(15);

        vm.prank(admin);
        marketplace.setFeeRecipient(address(0x123));

        assertEq(marketplace.feePercentage(), 15);
        assertEq(marketplace.feeRecipient(), address(0x123));
    }

    function test_batchBuy() public {
        vm.prank(seller);
        marketplace.listItem(address(nft), TOKEN_ID, 5, LIST_PRICE);

        vm.prank(seller);
        marketplace.listItem(address(nft), TOKEN_ID + 1, 5, LIST_PRICE);

        uint256[] memory listingIds = new uint256[](2);
        listingIds[0] = TOKEN_ID;
        listingIds[1] = TOKEN_ID + 1;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 2;
        amounts[1] = 3;

        uint256 totalPrice = (2 + 3) * LIST_PRICE;
        vm.deal(buyer, totalPrice);

        vm.prank(buyer);
        marketplace.batchBuy{value: totalPrice}(listingIds, amounts);

        assertEq(nft.balanceOf(buyer, TOKEN_ID), 2);
        assertEq(nft.balanceOf(buyer, TOKEN_ID + 1), 3);
    }

    function test_withdrawFunds() public {
        vm.prank(seller);
        marketplace.listItem(address(nft), TOKEN_ID, MINT_AMOUNT, LIST_PRICE);

        uint256 buyAmount = 5;
        uint256 totalPrice = buyAmount * LIST_PRICE;
        vm.deal(buyer, totalPrice);
        vm.prank(buyer);
        marketplace.buyItem{value: totalPrice}(TOKEN_ID, buyAmount);

        uint256 sellerBalanceBefore = seller.balance;
        vm.prank(seller);
        marketplace.withdrawFunds();

        assertGt(seller.balance, sellerBalanceBefore);
        assertEq(marketplace.pendingWithdrawals(seller), 0);
    }

    function test_insufficientFundsBuy() public {
        vm.prank(seller);
        marketplace.listItem(address(nft), TOKEN_ID, MINT_AMOUNT, LIST_PRICE);

        vm.expectRevert("Insufficient funds");
        marketplace.buyItem{value: LIST_PRICE - 1}(TOKEN_ID, 1);
    }

    function test_inactiveListingBuy() public {
        // Create and deactivate listing
        vm.prank(seller);
        marketplace.listItem(address(nft), TOKEN_ID, MINT_AMOUNT, LIST_PRICE);

        // Buy all items to deactivate listing
        vm.deal(buyer, MINT_AMOUNT * LIST_PRICE);
        vm.prank(buyer);
        marketplace.buyItem{value: MINT_AMOUNT * LIST_PRICE}(
            TOKEN_ID,
            MINT_AMOUNT
        );

        // Attempt buy from inactive listing
        vm.expectRevert("Listing inactive");
        marketplace.buyItem{value: LIST_PRICE}(TOKEN_ID, 1);
    }
}
