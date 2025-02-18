pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";  // Import LessThan

template Transaction() {
    signal input sender_balance;  // Sender's balance before the transaction
    signal input amount;          // Transaction amount
    signal output new_balance;    // Sender's balance after the transaction

    new_balance <== sender_balance - amount;

    // Ensure the sender has enough balance (new_balance >= 0)
    component isNegative = LessThan(252);  // Use 252 instead of 256
    isNegative.in[0] <== new_balance;
    isNegative.in[1] <== 0;  // Compare with 0

    // Enforce that new_balance is NOT negative
    isNegative.out === 0;
}

component main = Transaction();
