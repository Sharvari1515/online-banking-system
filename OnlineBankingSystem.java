import java.io.*;
import java.time.LocalDateTime;
import java.util.*;

class Transaction {
    private String type;
    private double amount;
    private LocalDateTime date;

    public Transaction(String type, double amount) {
        this.type = type;
        this.amount = amount;
        this.date = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return type + ": Rs." + amount + " on " + date.toString();
    }
}

class Account {
    private String username;
    private String password;
    private double balance;
    private ArrayList<Transaction> transactions;

    public Account(String username, String password, double balance) {
        this.username = username;
        this.password = password;
        this.balance = balance;
        this.transactions = new ArrayList<>();
    }

    public String getUsername() {
        return username;
    }

    public boolean authenticate(String pass) {
        return this.password.equals(pass);
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        balance += amount;
        transactions.add(new Transaction("Deposit", amount));
    }

    public boolean withdraw(double amount) {
        if (amount > balance) return false;
        balance -= amount;
        transactions.add(new Transaction("Withdraw", amount));
        return true;
    }

    public boolean transfer(Account receiver, double amount) {
        if (amount > balance) return false;
        this.withdraw(amount);
        receiver.deposit(amount);
        transactions.add(new Transaction("Transferred to " + receiver.getUsername(), amount));
        receiver.transactions.add(new Transaction("Received from " + this.username, amount));
        return true;
    }

    public void showTransactions() {
        if (transactions.isEmpty()) {
            System.out.println("No transactions yet.");
        } else {
            for (Transaction t : transactions) {
                System.out.println(t);
            }
        }
    }

    public String toDataString() {
        return username + "," + password + "," + balance;
    }
}

public class OnlineBankingSystem {
    static Map<String, Account> accounts = new HashMap<>();
    static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {
        loadDefaultAccountsIfNotExist();
        loadAccounts();

        while (true) {
            System.out.println("\n--- Welcome to Online Banking System ---");
            System.out.println("1. Create Account");
            System.out.println("2. Login");
            System.out.println("3. Exit");
            System.out.print("Enter your choice: ");
            int choice = sc.nextInt();
            sc.nextLine(); // consume newline

            switch (choice) {
                case 1:
                    createAccount();
                    break;
                case 2:
                    login();
                    break;
                case 3:
                    saveAccounts();
                    System.out.println("Thank you for using Online Banking System!");
                    System.exit(0);
                default:
                    System.out.println("Invalid choice!");
            }
        }
    }

    static void createAccount() {
        System.out.print("Enter username: ");
        String user = sc.nextLine().trim();
        if (accounts.containsKey(user)) {
            System.out.println("Username already exists.");
            return;
        }

        System.out.print("Enter password: ");
        String pass = sc.nextLine().trim();

        Account acc = new Account(user, pass, 10000.0); // Starts with ₹10,000
        accounts.put(user, acc);
        saveAccounts();
        System.out.println("Account created successfully with ₹10,000 balance.");
    }

    static void login() {
        System.out.print("Enter username: ");
        String user = sc.nextLine();
        System.out.print("Enter password: ");
        String pass = sc.nextLine();

        Account acc = accounts.get(user);
        if (acc != null && acc.authenticate(pass)) {
            System.out.println("Login successful!");
            loggedInMenu(acc);
        } else {
            System.out.println("Invalid username or password.");
        }
    }

    static void loggedInMenu(Account acc) {
        while (true) {
            System.out.println("\n--- Banking Menu ---");
            System.out.println("1. Check Balance");
            System.out.println("2. Deposit");
            System.out.println("3. Withdraw");
            System.out.println("4. Transfer Money");
            System.out.println("5. Transaction History");
            System.out.println("6. Logout");

            System.out.print("Enter your choice: ");
            int ch = sc.nextInt();
            sc.nextLine(); // consume newline

            switch (ch) {
                case 1:
                    System.out.println("Your balance is: Rs." + acc.getBalance());
                    break;
                case 2:
                    System.out.print("Enter amount to deposit: ");
                    double dep = sc.nextDouble();
                    acc.deposit(dep);
                    System.out.println("Deposit successful.");
                    break;
                case 3:
                    System.out.print("Enter amount to withdraw: ");
                    double with = sc.nextDouble();
                    if (acc.withdraw(with)) {
                        System.out.println("Withdrawal successful.");
                    } else {
                        System.out.println("Insufficient balance.");
                    }
                    break;
                case 4:
                    System.out.print("Enter recipient username: ");
                    String toUser = sc.nextLine();
                    Account receiver = accounts.get(toUser);
                    if (receiver == null) {
                        System.out.println("Recipient account not found.");
                        break;
                    }
                    System.out.print("Enter amount to transfer: ");
                    double amt = sc.nextDouble();
                    if (acc.transfer(receiver, amt)) {
                        System.out.println("Transfer successful to " + toUser);
                    } else {
                        System.out.println("Transfer failed. Check balance.");
                    }
                    break;
                case 5:
                    acc.showTransactions();
                    break;
                case 6:
                    saveAccounts();
                    System.out.println("Logged out.");
                    return;
                default:
                    System.out.println("Invalid option.");
            }
        }
    }

    static void loadDefaultAccountsIfNotExist() {
        File file = new File("accounts.txt");
        if (!file.exists()) {
            try (BufferedWriter bw = new BufferedWriter(new FileWriter(file))) {
                bw.write("sohan,pass123,24000.0\n");
                bw.write("sharvari,abc123,14000.0\n");
                bw.write("basanth,password1,21000.0\n");
                bw.write("darshan,neha@123,8000.0\n");
                bw.write("prahllad,java456,10000.0\n");
            } catch (IOException e) {
                System.out.println("Failed to write default accounts.");
            }
        }
    }

    static void loadAccounts() {
        try (BufferedReader br = new BufferedReader(new FileReader("accounts.txt"))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                String user = parts[0];
                String pass = parts[1];
                double bal = Double.parseDouble(parts[2]);
                accounts.put(user, new Account(user, pass, bal));
            }
        } catch (IOException e) {
            System.out.println("No existing accounts found. Starting fresh.");
        }
    }

    static void saveAccounts() {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter("accounts.txt"))) {
            for (Account acc : accounts.values()) {
                bw.write(acc.toDataString());
                bw.newLine();
            }
        } catch (IOException e) {
            System.out.println("Error saving accounts.");
        }
    }
}
