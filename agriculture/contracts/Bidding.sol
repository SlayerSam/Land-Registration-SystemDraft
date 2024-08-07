// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./Land.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Bidding is Ownable(msg.sender) {
    Land private LandContract;

    constructor(address _landContractAddress) {
        LandContract = Land(_landContractAddress);
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    struct LandBid {
        uint256 landId;
        uint256 amount;
        uint256 closingTime;
        address owner;
        mapping(address => Bid) bids;
        address[] bidderAddresses;
    }

    mapping(uint256 => LandBid) public landBids;

    event BidPlaced(uint256 landId, address bidder, uint256 amount);

    function getTimeStamp(
        uint256 id
    ) external view onlyOwner returns (uint256) {
        return landBids[id].closingTime;
    }

    function createLandBid(
        uint256 landId,
        uint256 closingTime,
        uint256 amount,
        address owner
    ) external onlyOwner {
        require(
            landBids[landId].closingTime == 0,
            "Bidding already exists for this land"
        );
        closingTime = block.timestamp + closingTime * 60;
        // closingTime = block.timestamp + closingTime *1 minutes;
        LandBid storage newBid = landBids[landId];
        newBid.landId = landId;
        newBid.amount = amount;
        newBid.closingTime = closingTime;
        newBid.owner = owner;
    }

    function placeBid(uint256 landId, address seller) external payable {
        LandBid storage currentBid = landBids[landId];

        // Ensure bidding is open and bid amount meets starting bid requirement
        require(
            currentBid.closingTime > block.timestamp,
            "Bidding closed for this land"
        );
        require(
            msg.value >= currentBid.amount,
            "Bid amount must be greater than or equal to the starting bid"
        );
        require(
            currentBid.bids[seller].bidder == address(0),
            "Bid already placed"
        );
        currentBid.bidderAddresses.push(seller);
        currentBid.bids[seller] = Bid(seller, msg.value, block.timestamp);
        emit BidPlaced(landId, msg.sender, msg.value);
    }

    function bidPlaced(
        uint256 landId,
        address seller
    ) public view returns (bool, uint256) {
        if (landBids[landId].bids[seller].amount > 0) {
            return (true, landBids[landId].bids[msg.sender].amount);
        }
        return (false, 0);
    }

    function getNumberOfBids(uint256 landId) public view returns (uint256) {
        LandBid storage currentBid = landBids[landId];
        uint256 count = 0;
        address[] memory bidderAddresses = currentBid.bidderAddresses;

        for (uint256 i = 0; i < bidderAddresses.length; i++) {
            if (currentBid.bids[bidderAddresses[i]].amount > 0) {
                count++;
            }
        }
        return count;
    }

    function getAddressAtIndex(
        LandBid storage currentBid,
        uint256 index
    ) private view returns (address) {
        require(index < getNumberOfBids(currentBid.landId), "Invalid index");
        address[] memory bidderAddresses = currentBid.bidderAddresses;
        return bidderAddresses[index];
    }

    function deleteBid(uint256 landId) external {
        delete landBids[landId];
    }

    function finalizeBid(
        uint256 landId,
        uint256 _timestamp
    ) external returns (uint256, address, address, uint256) {
        LandBid storage currentBid = landBids[landId];
        require(
            currentBid.closingTime < _timestamp,
            "Bidding is still ongoing"
        );
        if (currentBid.bidderAddresses.length < 1) {
            return (landId, address(0), currentBid.owner, 0);
        } else {
            // Find the highest bidder
            address highestBidder = address(0);
            uint256 highestBid = 0;
            for (uint256 i = 0; i < currentBid.bidderAddresses.length; i++) {
                address bidderAddress = currentBid.bidderAddresses[i];
                if (currentBid.bids[bidderAddress].amount > highestBid) {
                    highestBidder = bidderAddress;
                    highestBid = currentBid.bids[bidderAddress].amount;
                }
            }
            payable(currentBid.owner).transfer(highestBid);
            // Return bid amounts to other bidders
            for (uint256 i = 0; i < currentBid.bidderAddresses.length; i++) {
                if (currentBid.bidderAddresses[i] != highestBidder) {
                    payable(currentBid.bidderAddresses[i]).transfer(
                        currentBid.bids[currentBid.bidderAddresses[i]].amount
                    );
                }
            }
            return (landId, highestBidder, currentBid.owner, highestBid);
            // Transfer ownership to the highest bidder (assuming Land.sol contract has a function for this)
            // Replace the above line with the appropriate call to your Land.sol contract function
        }
    }
}
