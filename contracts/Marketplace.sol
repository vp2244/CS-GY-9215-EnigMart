// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Marketplace is ReentrancyGuard {
    enum ListingStatus {
        Available,
        Pending,
        Sold,
        Cancelled
    }

    struct Listing {
        uint256 id;
        address seller;
        address buyer;
        string title;
        string category;
        string condition;
        uint256 priceInSCT;
        string imageUrl;
        ListingStatus status;
        uint256 purchaseTimestamp;
    }

    IERC20 public immutable sctToken;
    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;

    event ListingCreated(
        uint256 indexed id,
        address indexed seller,
        address buyer,
        string title,
        string category,
        string condition,
        uint256 priceInSCT,
        string imageUrl,
        ListingStatus status,
        uint256 purchaseTimestamp
    );

    constructor(IERC20 tokenAddress) {
        sctToken = tokenAddress;
    }

    function createListing(
        string memory title,
        string memory category,
        string memory condition,
        uint256 price,
        string memory imageUrl
    ) external nonReentrant returns (uint256) {
        require(bytes(title).length > 0, "Marketplace: title required");
        require(bytes(category).length > 0, "Marketplace: category required");
        require(price > 0, "Marketplace: price must be positive");

        uint256 listingId = nextListingId;
        listings[listingId] = Listing({
            id: listingId,
            seller: msg.sender,
            buyer: address(0),
            title: title,
            category: category,
            condition: condition,
            priceInSCT: price,
            imageUrl: imageUrl,
            status: ListingStatus.Available,
            purchaseTimestamp: 0
        });

        emit ListingCreated(
            listingId,
            msg.sender,
            address(0),
            title,
            category,
            condition,
            price,
            imageUrl,
            ListingStatus.Available,
            0
        );

        nextListingId = listingId + 1;
        return listingId;
    }
}
