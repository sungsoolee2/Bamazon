var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

//set intital 10 products in database
var totalproducts = parseInt(10);

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;

});


function displayInventory() {
    //Display store items , id ,and price and stock_quantity//

    connection.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;
        var inventory = "";
        for (var i = 0; i < result.length; i++) {
            inventory = "";
            inventory += "Item ID: " + result[i].item_id + " | ";
            inventory += "Product Name: " + result[i].product_name + " | ";
            inventory += "Department: " + result[i].department_name + " | ";
            inventory += "Price : " + result[i].price + " | ";
            inventory += "Quantity: " + result[i].stock_quantity + "\n";

            console.log(inventory);
        }
        //prompt user function call//
        start();

    });
}


function displayLowInventory() {

    //display products that have less than 100 inventory//
    connection.query("SELECT * FROM products WHERE stock_quantity < 100", function (err, result) {
        if (err) throw err;
        var inventory = "";
        for (var i = 0; i < result.length; i++) {
            inventory = "";
            inventory += "Item ID: " + result[i].item_id + " | ";
            inventory += "Product Name: " + result[i].product_name + " | ";
            inventory += "Department: " + result[i].department_name + " | ";
            inventory += "Price : " + result[i].price + " | ";
            inventory += "Quantity: " + result[i].stock_quantity + "\n";

            console.log(inventory);
        }
        //prompt user function call//
        start();

    });
}

function start() {
    // prompt for info about the item being put up for auction
    inquirer
        .prompt([
            {
                name: "action",
                type: "list",
                message: "Please select from Menu",
                choices: ["View Products", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]

            }])
        .then(function (answer) {
            switch (answer.action) {
                case "View Products":
                    displayInventory();
                    break;

                case "View Low Inventory":
                    displayLowInventory();
                    break;

                case "Add to Inventory":
                    addToInventory();
                    break;

                case "Add New Product":
                    addNewProduct();
                    break;

                case "Exit":
                    connection.end();
                    break;
            }
        });
}

function addToInventory() {
    // prompt for info on item and quantity to add to inventory//
    inquirer
        .prompt([
            {
                name: "itemid",
                type: "input",
                message: "Please enter the ID of the Product to Add.",
                filter: Number,

                // validate input is number from 1-10
                validate: function (value) {
                    if (!isNaN(value) && (value > 0 && value <= totalproducts)) {
                        return true;
                    } else {
                        console.log('   Please enter a number from 1 to ' + totalproducts);
                        return false;
                    }
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "Please enter Quantity of the product to Add.",
                filter: Number,

                validate: function (value) {
                    if (!isNaN(value)) {
                        return true;
                    } else {
                        console.log(' Please enter a valid number!');
                        return false;
                    }
                }
            }

        ]).then(function (answer) {
            //assigning var to item, quant //
            var itemSelected = (answer.itemid);
            console.log(itemSelected);

            var quantSelected = parseInt(answer.quantity);
            console.log(quantSelected);

            // Verifiy that id entered is in the database and is a valid id//
            connection.query("SELECT * FROM products WHERE ?", [{ item_id: itemSelected }], function (err, result) {
                if (err) throw err;
                console.log(JSON.stringify(result));
                if (result.length === 0) {
                    console.log("Please enter a valid product ID number!");
                    displayInventory();

                } else {

                    var product = result[0];
                    console.log(product);
                    // add item and quantity updates//

                    console.log("You added " + quantSelected + "  " + product.product_name)
                    console.log("Your order has been updated. The total stock quantity is now " + (product.stock_quantity + quantSelected))

                    connection.query("UPDATE products SET stock_quantity = " + (product.stock_quantity + quantSelected)
                        + " WHERE item_id = " + itemSelected), function (err, result) {
                            if (err) throw err;
                        }
                        start();   
                }

            })
        })
        
}



function addNewProduct() {
    // prompt for info to add new product to database Bamazon//
    inquirer
        .prompt([
            {
                name: "product_name",
                type: "input",
                message: "Please enter Product Name?",
            },
            {
                name: "department_name",
                type: "input",
                message: "Please enter Department Name?",

            },
            {
                name: "price",
                type: "input",
                message: "Please enter the price per item",
                filter: Number,
                // validate input decimal to 2 places
                validate: function (value) {
                    if (!isNaN(value) && (parseFloat(value) > 0)) {
                        return true;
                    } else {
                        console.log('   Please enter a valid number!');
                        return false;
                    }
                }
            },
            {
                name: "stock_quantity",
                type: "input",
                message: "Please enter quantity of items to stock?",
                filter: Number,

                validate: function (value) {
                    if (!isNaN(value)) {
                        return true;
                    } else {
                        console.log(' Please enter a valid number!');
                        return false;
                    }
                }
            }

        ]).then(function (answer) {
               
                // add new item to database update total products//
                totalproducts++;
                var field=totalproducts;
                connection.query("INSERT INTO products SET ?", answer, function (err, result, field) {
                        if (err) throw err;

                        console.log("Product Id number is: "+ answer.item_id)
                        console.log("You added" + answer.stock_quantity + "  " + answer.product_name)
                        console.log("In Department" + answer.department_name + " at a price per unit of: "+answer.price)
                        
                    })
            })  
}

displayInventory();














