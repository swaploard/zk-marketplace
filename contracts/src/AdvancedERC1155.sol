// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract AdvancedERC1155 is
    ERC1155,
    ERC1155Supply,
    Ownable,
    ReentrancyGuard,
    ERC2981
{
    // Struct to define token properties
    struct TokenConfig {
        uint256 maxSupply;
        uint256 mintPrice;
        bool isFungible;
    }

    // State variables
    mapping(uint256 => string) private _tokenCIDs;
    mapping(uint256 => bool) private _isIdMinted;
    string public contractURI;
    string public name;
    string public symbol;
    string private _baseGatewayURI;
    uint256 private currentTokenId = 1;
    uint256[] private _configuredIds;
    uint256[] private _mintedIds;

    // Events
    event TokenMinted(address indexed to, uint256 id, uint256 amount);
    event TokenBurned(address indexed from, uint256 id, uint256 amount);
    event RoyaltiesUpdated(address recipient, uint96 feeBasisPoints);
    event MetadataURIUpdated(string newUri);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _uri,
        string memory _contractURI,
        address _royaltyRecipient,
        uint96 _royaltyFee,
        address appoveMarketplace
    ) ERC1155("") Ownable(msg.sender) {
        name = _name;
        symbol = _symbol;
        contractURI = _contractURI;
        _baseGatewayURI = _uri;
        _setDefaultRoyalty(_royaltyRecipient, _royaltyFee);
        setApprovalForAll(appoveMarketplace, true);
    }

    // ================== Core Functions ================== //

    // Mint tokens (owner only)
    function mint(
        address to,
        uint256 amount,
        string memory cid,
        bytes memory data
    ) external onlyOwner {
        uint256 id = currentTokenId;
        _mint(to, id, amount, data);
        _mintedIds.push(id);
        _isIdMinted[id] = true;
        _tokenCIDs[id] = cid;
        emit TokenMinted(to, id, amount);
        currentTokenId++;
    }

    // Batch mint tokens (owner only)
    function mintBatch(
        address to,
        uint256[] memory amounts,
        bytes memory data
    ) external onlyOwner {
        uint256[] memory ids = new uint256[](amounts.length);
        for (uint256 i = 0; i < amounts.length; i++) {
            ids[i] = currentTokenId + i;
        }
        _mintBatch(to, ids, amounts, data);
        for (uint256 i = 0; i < ids.length; i++) {
            emit TokenMinted(to, ids[i], amounts[i]);
            _mintedIds.push(ids[i]);
            _isIdMinted[ids[i]] = true;
        }
        currentTokenId += amounts.length;
    }

    // Public mint with payment
    function publicMint(uint256 amount) external payable nonReentrant {
        if (amount == 0) {
            revert("ERC1155: mint amount must be positive");
        }
        uint256 id = currentTokenId;
        _mint(msg.sender, id, amount, "");
        _mintedIds.push(id);
        _isIdMinted[id] = true;
        emit TokenMinted(msg.sender, id, amount);
        currentTokenId++;
    }

    // Burn tokens
    function burn(address from, uint256 id, uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not token owner or approved"
        );
        _burn(from, id, amount);
        emit TokenBurned(from, id, amount);
    }

    // ================== Configuration Functions ================== //

    // Set royalty info (owner only)
    function setRoyaltyInfo(
        address recipient,
        uint96 feeBasisPoints
    ) external onlyOwner {
        _setDefaultRoyalty(recipient, feeBasisPoints);
        emit RoyaltiesUpdated(recipient, feeBasisPoints);
    }

    // Update metadata URI (owner only)
    function setURI(string memory newUri) external onlyOwner {
        _setURI(newUri);
        emit MetadataURIUpdated(newUri);
    }

    // Set contract-level metadata
    function setContractURI(string memory _contractURI) external onlyOwner {
        contractURI = _contractURI;
    }

    function setApprovalForAll(
        address operator,
        bool approved
    ) public override(ERC1155) {
        super.setApprovalForAll(operator, approved);
    }

    // ================== Utility Functions ================== //

    // Withdraw funds (owner only)
    function withdraw() external onlyOwner nonReentrant {
        address payable recipient = payable(owner());
        uint256 amount = address(this).balance;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Withdraw failed");
    }
    
    // Override required by Solidity
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    // =============== URI Management =============== //
    function uri(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(_baseGatewayURI, _tokenCIDs[tokenId]));
    }

    // Interface support
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenBalance(
        address owner,
        uint256 id
    ) public view returns (uint256) {
        return balanceOf(owner, id);
    }
}
