 pragma solidity ^0.4.23;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

contract XDAYTEAM is Ownable {
    
    /*
    * Product data
    */
    
    struct Product{
        string name;
        bytes16 idProduct;
        address idAddress;
        uint price;
        uint created_at;
    }
    
    mapping (bytes16 => Product) products;
    
    bytes16[] public productAccts;
    
    /*
    * Account data
    */
    struct Account{
        string name;
        string phone;
        address idAddress;
        uint role;
        uint balance;
    }
    
    mapping (address => Account) accounts;
    
    address[] public accountAccts;
    
    
     /*
    * Transaction data
    */
    
    struct Transaction{
        address idAddressA; 
        address idAddressB; 
        bytes16 idProduct;
        bytes16 idTransaction;
        uint priceShip;
        string addressCustomer;
    }
    
    mapping (bytes16 => Transaction) transactions;
    
    bytes16[] public transactionAccts;
    
    /*
    *add product
    */
    
    function addProduct(address _idAddress, bytes16 _idProduct, string _name, uint _price) external onlyOwner{
        
        if(products[_idProduct].idProduct == ''){
            Product storage product_info = products[_idProduct];
        
            product_info.name = _name;
            product_info.idAddress = _idAddress;
            product_info.idProduct = _idProduct;
            product_info.price = _price;
            
            accounts[_idAddress].balance += _price;
            
            productAccts.push(_idProduct) -1;
        }
        
        
    }
    
    /*
    * get all product ID
    */
    
    function getAllProductID() view public returns(bytes16[]){
        return productAccts;
    }
    

    /*
    * get info product by ID
    */
    
    function getInfoProduct(bytes16 _idProduct) view public returns(
        address idAddress,
        bytes16 idProduct,
        string name,
        uint price
        ){
        return (
            products[_idProduct].idAddress, 
            products[_idProduct].idProduct,
            products[_idProduct].name,
            products[_idProduct].price
            );
    }
    
    /*
    get total products
    */
    function countProducts() view public returns(uint){
        return productAccts.length;
    }
    
    /*
    * add account
    */
    
    function addAccount(address _idAddress, string _name, string _phone, uint _role) external onlyOwner{
        
        if(accounts[_idAddress].idAddress == 0){
            Account storage account_info = accounts[_idAddress];
        
            account_info.idAddress = _idAddress;
            account_info.name = _name;
            account_info.phone = _phone;
            account_info.role = _role;
            
            //set default balance
            account_info.balance = 100;
            
            accountAccts.push(_idAddress) -1;
        }
        
        
    }
    
    function addBalance(address _idAddress, uint _balance) external onlyOwner{
        if(accounts[_idAddress].idAddress != 0){
            accounts[_idAddress].balance += _balance;
        }
    }
    
    function getBalance(address _idAddress) view public returns(uint){
        return accounts[_idAddress].balance;
    }
    
    /*
    * get all account address
    */
    
    function getAllAccounts() view public returns(address[]){
        return accountAccts;
    }
    

    /*
    * get info account by address
    */
    
    function getInfoAccount(address _idAddress) view public returns(
        address idAddress,
        string name,
        string phone,
        uint role
        ){
        return (
            accounts[_idAddress].idAddress, 
            accounts[_idAddress].name,
            accounts[_idAddress].phone,
            accounts[_idAddress].role
            );
    }
    
    /*
    get total accounts
    */
    function countAccounts() view public returns(uint){
        return accountAccts.length;
    }

    
    
    /*
    * Get shipper info by address
    */
    
    function getListShipper(address _idAddress) view public returns(
        address idAddress,
        string name,
        string phone,
        uint role
        ){
            if(accounts[_idAddress].role==1){
                 return (
                        accounts[_idAddress].idAddress, 
                        accounts[_idAddress].name,
                        accounts[_idAddress].phone,
                        accounts[_idAddress].role
                        );
            }
            return(_idAddress,'','',200);
        }
  
   /*
    *add transaction
    */
    
    function addTransaction(
        address _idAddressA, 
        address _idAddressB, 
        bytes16 _idProduct, 
        bytes16 _idTransaction, 
        uint _priceShip,
        string _addressCustomer) external onlyOwner{
        
        if(transactions[_idTransaction].idTransaction == 0){
            //store data
            Transaction storage transaction_info = transactions[_idTransaction];
        
            transaction_info.idAddressA = _idAddressA;
            transaction_info.idAddressB = _idAddressB;
            transaction_info.idProduct = _idProduct;
            transaction_info.idTransaction = _idTransaction;
            transaction_info.priceShip = _priceShip;
            transaction_info.addressCustomer = _addressCustomer;
            
            //change balance
            accounts[_idAddressA].balance -= _priceShip;
            accounts[_idAddressB].balance += _priceShip;
            
            
            transactionAccts.push(_idTransaction) -1;
        }
        
        
    }
    
    /*
    * get all product ID
    */
    
    function getAllTransactionId() view public returns(bytes16[]){
        return transactionAccts;
    }
    

    /*
    * get info transaction by ID
    */
    
    function getTransactionByID(bytes16 _idTransaction) view public returns(
        address idAddressA, 
        address idAddressB, 
        bytes16 idProduct, 
        bytes16 idTransaction, 
        uint priceShip,
        string addressCustomer
        ){
        return (
            transactions[_idTransaction].idAddressA, 
            transactions[_idTransaction].idAddressB,
            transactions[_idTransaction].idProduct,
            transactions[_idTransaction].idTransaction,
            transactions[_idTransaction].priceShip,
            transactions[_idTransaction].addressCustomer
            );
    }
    
    /*
    get total transactions
    */
    function countTransactions() view public returns(uint){
        return transactionAccts.length;
    }


}