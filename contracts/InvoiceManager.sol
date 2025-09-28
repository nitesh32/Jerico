// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InvoiceFactory {
    IERC20 public immutable pyusd;

    struct Invoice {
        string orgName;
        string workDescription;
        uint256 amount;
        uint256 billDate;
        uint256 dueDate;
        address payable receiver;
        bool isPaid;
    }

    // user → their invoice IDs
    mapping(address => bytes32[]) public userInvoices;
    // invoice ID → invoice data
    mapping(bytes32 => Invoice) public invoices;

    event InvoiceCreated(
        address indexed user, 
        bytes32 indexed id, 
        string orgName, 
        uint256 amount,
        uint256 dueDate
    );
    event InvoicePaid(bytes32 indexed id, address indexed payer, uint256 amount);

    constructor(address _pyusd) {
        pyusd = IERC20(_pyusd);
    }

    function createInvoice(
        string calldata orgName,
        string calldata workDescription,
        uint256 amount,
        uint256 dueDate
    ) external returns (bytes32) {
        bytes32 id = keccak256(
            abi.encodePacked(
                msg.sender, 
                orgName, 
                workDescription, 
                amount, 
                block.timestamp,
                block.number
            )
        );
        
        require(invoices[id].receiver == address(0), "Invoice ID already exists");

        invoices[id] = Invoice({
            orgName: orgName,
            workDescription: workDescription,
            amount: amount,
            billDate: block.timestamp,
            dueDate: dueDate,
            receiver: payable(msg.sender),
            isPaid: false
        });

        userInvoices[msg.sender].push(id);
        
        emit InvoiceCreated(msg.sender, id, orgName, amount, dueDate);
        return id;
    }

    function payInvoice(bytes32 id) external {
        Invoice storage invoice = invoices[id];
        require(invoice.receiver != address(0), "Invoice not found");
        require(!invoice.isPaid, "Invoice already paid");
        require(block.timestamp <= invoice.dueDate, "Invoice expired");

        // Direct PYUSD transfer from payer to invoice receiver
        // Note: Payer must approve this contract to spend their PYUSD first
        require(
            pyusd.transferFrom(msg.sender, invoice.receiver, invoice.amount),
            "PYUSD transfer failed - check allowance and balance"
        );

        invoice.isPaid = true;
        emit InvoicePaid(id, msg.sender, invoice.amount);
    }

    // View functions
    function getUserInvoices(address user) external view returns (bytes32[] memory) {
        return userInvoices[user];
    }

    function getInvoice(bytes32 id) external view returns (
        string memory orgName,
        string memory workDescription,
        uint256 amount,
        uint256 billDate,
        uint256 dueDate,
        address receiver,
        bool isPaid
    ) {
        Invoice storage invoice = invoices[id];
        return (
            invoice.orgName,
            invoice.workDescription,
            invoice.amount,
            invoice.billDate,
            invoice.dueDate,
            invoice.receiver,
            invoice.isPaid
        );
    }

    function isInvoicePaid(bytes32 id) external view returns (bool) {
        return invoices[id].isPaid;
    }

    function getUserInvoiceCount(address user) external view returns (uint256) {
        return userInvoices[user].length;
    }
}