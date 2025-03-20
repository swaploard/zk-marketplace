// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract AdvancedERC1155 is ERC1155, Ownable, ReentrancyGuard, ERC2981, ERC1155Supply {
    // Struct to define token properties
    struct TokenConfig {
        uint256 maxSupply;
        uint256 mintPrice;
        bool isFungible;
    }

    // State variables
    mapping(uint256 => TokenConfig) public tokenConfigs;
    string public contractURI;
    string public name;
    string public symbol;

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
        uint96 _royaltyFee
    ) ERC1155(_uri) Ownable(msg.sender) {
        name = _name;
        symbol = _symbol;
        contractURI = _contractURI;
        _setDefaultRoyalty(_royaltyRecipient, _royaltyFee);
    }

    // ================== Core Functions ================== //

    // Mint tokens (owner only)
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyOwner {
        require(!tokenConfigs[id].isFungible || amount == 1, "NFTs must be minted 1 at a time");
        _mint(to, id, amount, data);
        emit TokenMinted(to, id, amount);
    }

    // Batch mint tokens (owner only)
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external onlyOwner {
        _mintBatch(to, ids, amounts, data);
        for (uint256 i = 0; i < ids.length; i++) {
            emit TokenMinted(to, ids[i], amounts[i]);
        }
    }

    // Public mint with payment
    function publicMint(
        uint256 id,
        uint256 amount
    ) external payable nonReentrant {
        TokenConfig memory config = tokenConfigs[id];
        require(msg.value >= config.mintPrice * amount, "Insufficient payment");
        require(totalSupply(id) + amount <= config.maxSupply, "Exceeds max supply");

        if (!config.isFungible) {
            require(amount == 1, "Cannot mint multiple NFTs");
            require(balanceOf(msg.sender, id) == 0, "Already owns this NFT");
        }

        _mint(msg.sender, id, amount, "");
        emit TokenMinted(msg.sender, id, amount);
    }

    // Burn tokens
    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) external {
        require(
            from == msg.sender || isApprovedForAll(from, msg.sender),
            "Not authorized"
        );
        _burn(from, id, amount);
        emit TokenBurned(from, id, amount);
    }

    // ================== Configuration Functions ================== //
    
    // Configure token properties (owner only)
    function configureToken(
        uint256 id,
        uint256 maxSupply,
        uint256 mintPrice,
        bool isFungible
    ) external onlyOwner {
        tokenConfigs[id] = TokenConfig(maxSupply, mintPrice, isFungible);
    }

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

    // ================== Utility Functions ================== //

    // Withdraw funds (owner only)
    function withdraw() external onlyOwner nonReentrant {
        (bool success, ) = owner().call{value: address(this).balance}("");
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

    // Interface support
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}