//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/AdvancedERC1155.sol";
import "../src/Marketplace.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract AdvancedERC1155Test is Test {
    AdvancedERC1155 public advancedERC1155Contract;
    ERC1155Marketplace public marketplaceContract;
    address public owner = payable(vm.addr(1));
    address public user = address(2);
    address public operator = vm.addr(3);
    address public attacker = vm.addr(4);
    string public constant BASE_URI = "https://example.com/";
    string public constant NEW_URI = "https://new.example.com/";
    string public constant CONTRACT_URI = "ipfs://contract-uri";
    uint256 public constant TEST_AMOUNT = 1 ether;

    event TokenMinted(address indexed to, uint256 id, uint256 amount);
    event TokenBurned(address indexed from, uint256 id, uint256 amount);
    event RoyaltiesUpdated(address recipient, uint96 feeBasisPoints);
    event MetadataURIUpdated(string newUri);

    function setUp() public {
        marketplaceContract = new ERC1155Marketplace(owner);
        address marketplaceContractAddress = address(marketplaceContract);

        vm.prank(owner);
        advancedERC1155Contract = new AdvancedERC1155(
            "TestadvancedERC1155Contract",
            "TadvancedERC1155Contract",
            BASE_URI,
            "contract-uri",
            address(this),
            1000,
            marketplaceContractAddress
        );
    }

    function test_OwnerCanMint() public {
        vm.startPrank(owner);
        uint256 firstTokenId = 1;
        uint256 mintAmount = 5;
        string memory cid = "cid123";

        vm.expectEmit(false, true, false, true);
        emit TokenMinted(user, firstTokenId, mintAmount);
        advancedERC1155Contract.mint(user, mintAmount, cid, "");

        assertEq(
            advancedERC1155Contract.balanceOf(user, firstTokenId),
            mintAmount
        );
        assertEq(
            advancedERC1155Contract.uri(firstTokenId),
            string(abi.encodePacked(BASE_URI, cid))
        );

        uint256 secondTokenId = 2;
        string memory cid2 = "cid456";

        vm.expectEmit(false, true, false, true);
        emit TokenMinted(user, secondTokenId, mintAmount);
        advancedERC1155Contract.mint(user, mintAmount, cid2, "");

        assertEq(
            advancedERC1155Contract.balanceOf(user, secondTokenId),
            mintAmount
        );
        assertEq(
            advancedERC1155Contract.uri(secondTokenId),
            string(abi.encodePacked(BASE_URI, cid2))
        );
    }

    function test_NonOwnerCannotMint() public {
        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                user
            )
        );
        advancedERC1155Contract.mint(user, 1, "cid123", "");
    }

    function test_MintIncrementsTokenId() public {
        vm.startPrank(owner);

        advancedERC1155Contract.mint(user, 1, "cid1", "");
        advancedERC1155Contract.mint(user, 1, "cid2", "");
        advancedERC1155Contract.mint(user, 1, "cid3", "");

        assertEq(advancedERC1155Contract.balanceOf(user, 1), 1);
        assertEq(advancedERC1155Contract.balanceOf(user, 2), 1);
        assertEq(advancedERC1155Contract.balanceOf(user, 3), 1);

        assertEq(
            advancedERC1155Contract.uri(1),
            string(abi.encodePacked(BASE_URI, "cid1"))
        );
        assertEq(
            advancedERC1155Contract.uri(2),
            string(abi.encodePacked(BASE_URI, "cid2"))
        );
        assertEq(
            advancedERC1155Contract.uri(3),
            string(abi.encodePacked(BASE_URI, "cid3"))
        );
    }

    function test_MintBatch() public {
        vm.startPrank(owner);

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 10;
        amounts[1] = 20;
        amounts[2] = 30;

        advancedERC1155Contract.mintBatch(user, amounts, "");

        assertEq(advancedERC1155Contract.balanceOf(user, 1), 10);
        assertEq(advancedERC1155Contract.balanceOf(user, 2), 20);
        assertEq(advancedERC1155Contract.balanceOf(user, 3), 30);
    }

    function test_PublicMintSuccess() public {
        uint256 amount = 5;

        vm.startPrank(user);
        vm.expectEmit(true, true, true, true);
        emit TokenMinted(user, 1, amount);
        advancedERC1155Contract.publicMint(amount);
        vm.stopPrank();

        assertEq(advancedERC1155Contract.balanceOf(user, 1), amount);
        assertEq(advancedERC1155Contract.uri(1), BASE_URI);
    }

    function test_PublicMintIncrementsId() public {
        vm.startPrank(user);
        advancedERC1155Contract.publicMint(1);
        advancedERC1155Contract.publicMint(1);
        vm.stopPrank();

        assertEq(advancedERC1155Contract.balanceOf(user, 1), 1);
        assertEq(advancedERC1155Contract.balanceOf(user, 2), 1);
    }

    function test_PublicMintWithValue() public {
        uint256 amount = 3;
        uint256 sendValue = 1 ether;

        vm.deal(user, sendValue);
        vm.startPrank(user);
        advancedERC1155Contract.publicMint{value: sendValue}(amount);
        vm.stopPrank();

        assertEq(address(advancedERC1155Contract).balance, sendValue);
        assertEq(advancedERC1155Contract.balanceOf(user, 1), amount);
    }

    function test_PublicMintZeroAmountReverts() public {
        vm.startPrank(user);
        vm.expectRevert("ERC1155: mint amount must be positive");
        advancedERC1155Contract.publicMint(0);
        vm.stopPrank();
    }

    function test_ConsecutivePublicMints() public {
        vm.startPrank(user);
        advancedERC1155Contract.publicMint(1);
        advancedERC1155Contract.publicMint(1);
        advancedERC1155Contract.publicMint(1);
        vm.stopPrank();

        assertEq(advancedERC1155Contract.balanceOf(user, 1), 1);
        assertEq(advancedERC1155Contract.balanceOf(user, 2), 1);
        assertEq(advancedERC1155Contract.balanceOf(user, 3), 1);
    }

    function test_BurnOwnTokens() public {
        uint256 id = 1;
        uint256 burnAmount = 2;

        vm.startPrank(user);
        advancedERC1155Contract.publicMint(5);
        vm.expectEmit(true, true, true, true);
        emit TokenBurned(user, id, burnAmount);
        advancedERC1155Contract.burn(user, id, burnAmount);
        vm.stopPrank();
        assertEq(advancedERC1155Contract.balanceOf(user, id), 5 - burnAmount);
    }

    function test_BurnApprovedOperator() public {
        uint256 id = 1;
        uint256 burnAmount = 3;
        vm.prank(user);
        advancedERC1155Contract.publicMint(5);
        assertEq(advancedERC1155Contract.balanceOf(user, id), 5);

        vm.prank(user);
        advancedERC1155Contract.setApprovalForAll(operator, true);

        vm.startPrank(operator);
        vm.expectEmit(true, true, true, true);
        emit TokenBurned(user, id, burnAmount);
        advancedERC1155Contract.burn(user, id, burnAmount);
        vm.stopPrank();
        assertEq(advancedERC1155Contract.balanceOf(user, id), 2);
        assertEq(advancedERC1155Contract.totalSupply(id), 2);
    }

    function test_BurnUnauthorizedReverts() public {
        uint256 id = 1;
        uint256 burnAmount = 1;
        vm.prank(user);
        advancedERC1155Contract.publicMint(5);

        vm.startPrank(attacker);
        vm.expectRevert("ERC1155: caller is not token owner or approved");
        advancedERC1155Contract.burn(user, id, burnAmount);
        vm.stopPrank();
    }

    function test_BurnExceedsBalanceReverts() public {
        uint256 id = 1;
        uint256 burnAmount = 6;
        vm.prank(user);
        advancedERC1155Contract.publicMint(5);

        bytes4 selector = bytes4(
            keccak256(
                "ERC1155InsufficientBalance(address,uint256,uint256,uint256)"
            )
        );
        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSelector(selector, user, 5, burnAmount, id)
        );
        advancedERC1155Contract.burn(user, id, burnAmount);
        vm.stopPrank();
    }

    function test_BurnZeroAmountReverts() public {
        vm.startPrank(user);
        vm.expectRevert("Amount must be positive");
        advancedERC1155Contract.burn(user, 1, 0);
        vm.stopPrank();
    }

    function test_TotalSupplyTracking() public {
        uint256 id = 1;
        vm.prank(user);
        advancedERC1155Contract.publicMint(5);

        assertEq(advancedERC1155Contract.totalSupply(id), 5);
        assertEq(advancedERC1155Contract.balanceOf(user, id), 5);

        vm.prank(user);
        advancedERC1155Contract.burn(user, id, 2);

        assertEq(advancedERC1155Contract.totalSupply(id), 3);
        assertEq(advancedERC1155Contract.balanceOf(user, id), 3);
    }

    function test_SetRoyaltyInfo() public {
        address newRecipient = address(3);
        uint96 newFee = 500; // 5%

        vm.expectEmit(true, true, false, false);
        emit RoyaltiesUpdated(newRecipient, newFee);

        vm.prank(owner);
        advancedERC1155Contract.setRoyaltyInfo(newRecipient, newFee);

        (address recipient, uint256 value) = advancedERC1155Contract
            .royaltyInfo(0, 10000);
        assertEq(recipient, newRecipient);
        assertEq(value, 500); // 5% of 10000
    }

    function test_NonOwnerCannotSetRoyalty() public {
        address nonOwner = address(2);

        vm.prank(nonOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                nonOwner
            )
        );
        advancedERC1155Contract.setRoyaltyInfo(address(3), 500);
    }

    function test_SetURI() public {
        string memory testCID = "cid123";
        uint256 tokenId = 1;

        vm.prank(owner);
        advancedERC1155Contract.mint(user, 1, testCID, "");

        vm.prank(owner);
        advancedERC1155Contract.setURI(BASE_URI);
        assertEq(
            advancedERC1155Contract.uri(tokenId),
            string(abi.encodePacked(BASE_URI, testCID))
        );
    }

    function test_SetContractURI() public {
        string memory newContractURI = "ipfs://new-contract-uri";

        vm.prank(owner);
        advancedERC1155Contract.setContractURI(newContractURI);

        assertEq(advancedERC1155Contract.contractURI(), newContractURI);
    }

    function test_SetApprovalForAll() public {
        address operator = address(3);

        vm.prank(user);
        advancedERC1155Contract.setApprovalForAll(operator, true);

        assertTrue(advancedERC1155Contract.isApprovedForAll(user, operator));
    }

    function test_WithdrawFunds() public {
        vm.deal(address(advancedERC1155Contract), TEST_AMOUNT);
 
        uint256 initialBalance = owner.balance;
        vm.prank(owner);
        advancedERC1155Contract.withdraw();

        assertEq(address(advancedERC1155Contract).balance, 0, "Contract balance not cleared");
        assertEq(owner.balance, initialBalance + 1 ether, "Funds not received");
    }

    function test_NonOwnerCannotWithdraw() public {
        address nonOwner = address(2);

        vm.prank(nonOwner);

        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                nonOwner
            )
        );

        advancedERC1155Contract.withdraw();
    }

    function test_SupplyTracking() public {
        uint256[] memory ids = new uint256[](1);
        ids[0] = 1;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 5;

        vm.prank(owner);
        advancedERC1155Contract.mintBatch(user, amounts, "");

        assertEq(advancedERC1155Contract.totalSupply(1), 5);
    }

    function test_TokenURI() public {
        vm.prank(owner);
        advancedERC1155Contract.mint(user, 1, "cid123", "");

        assertEq(
            advancedERC1155Contract.uri(1),
            string(abi.encodePacked(BASE_URI, "cid123"))
        );
    }

    function test_SupportsInterfaces() public view {
        assertTrue(
            advancedERC1155Contract.supportsInterface(
                type(IERC1155).interfaceId
            )
        );
        assertTrue(
            advancedERC1155Contract.supportsInterface(
                type(IERC2981).interfaceId
            )
        );
    }

    function test_TokenBalance() public {
        vm.prank(owner);
        advancedERC1155Contract.mint(user, 1, "cid123", "");

        assertEq(advancedERC1155Contract.tokenBalance(user, 1), 1);
    }
}
