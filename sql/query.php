<?php
// Connect to the database
$servername = "localhost";
$username = "flint_user";
$password = "";
$dbname = "flint";
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed:</strong> " . $conn->connect_error);
}

// Get the form data
$sender = $_POST['sender'];
$email_to = $_POST['email_to'];
$subject = $_POST['subject'];
$attachments = $_POST['attachments'];
$cc = $_POST['cc'];
$datestart = $_POST['datestart'];
$dateend = $_POST['dateend'];
$email_order = $_POST['email_order'];
$full_email = $_POST['full_email'];
$header = $_POST['header'];
$email_id = $_POST['email_id'];
$pages = $_POST['pages'];
$bookmark = $_POST['bookmark'];
$pdf = $_POST['pdf'];
$bm_title = $_POST['bm_title'];
$acode = $_POST['acode'];
$bcode = $_POST['bcode'];

// Build the SQL query
$sql = "SELECT * FROM emails WHERE 1=1";
if ($sender != '') {
  $sql .= " AND sender LIKE '%$sender%'";
}
if ($email_to != '') {
  $sql .= " AND email_to LIKE '%$email_to%'";
}
if ($subject != '') {
  $sql .= " AND subject LIKE '%$subject%'";
}
if ($attachments != '') {
  $sql .= " AND attachments LIKE '%$attachments%'";
}
if ($cc != '') {
  $sql .= " AND cc LIKE '%$cc%'";
}
if ($datestart != '') {
  $sql .= " AND timestamp >= '$datestart'";
}
if ($dateend != '') {
  $sql .= " AND timestamp <= '$dateend'";
}
if ($email_order != '') {
  $sql .= " AND email_order LIKE '%$email_order%'";
}
if ($full_email != '') {
  $sql .= " AND full_email LIKE '%$full_email%'";
}
if ($header != '') {
  $sql .= " AND header LIKE '%$header%'";
}
if ($email_id != '') {
  $sql .= " AND email_id LIKE '%$email_id%'";
}
if ($pages != '') {
  $sql .= " AND pages LIKE '%$pages%'";
}
if ($bookmark != '') {
  $sql .= " AND bookmark LIKE '%$bookmark%'";
}
if ($pdf != '') {
  $sql .= " AND pdf LIKE '%$pdf%'";
}
if ($bm_title != '') {
  $sql .= " AND bm_title LIKE '%$bm_title%'";
}
if ($acode != '') {
  $sql .= " AND acode LIKE '%$acode%'";
}
if ($bcode != '') {
  $sql .= " AND bcode LIKE '%$bcode%'";
}

// Execute the query
$result = $conn->query($sql);

// Display the results
if ($result->num_rows > 0) {
  echo "<strong>Results:</strong> " . $result->num_rows . "<br><br>";
  while($row = $result->fetch_assoc()) {
    // convert $row["timestamp"] from unix to a date
    $date = date("m/d/Y", $row["timestamp"]);    
    echo "<strong>Sender:</strong> " . $row["sender"] . "<br>";
    echo "<strong>Email To:</strong> " . $row["email_to"] . "<br>";
    echo "<strong>Subject:</strong> " . $row["subject"] . "<br>";
    echo "<strong>Attachments:</strong> " . $row["attachments"] . "<br>";
    echo "<strong>CC:</strong> " . $row["cc"] . "<br>";
    echo "<strong>Timestamp:</strong> " . $date . "<br>";
    echo "<strong>Email Order:</strong> " . $row["email_order"] . "<br>";
    echo "<strong>Full Email:</strong> " . $row["full_email"] . "<br>";
    echo "<strong>Header:</strong> " . $row["header"] . "<br>";
    echo "<strong>Email ID:</strong> " . $row["email_id"] . "<br>";
    echo "<strong>Pages:</strong> " . $row["pages"] . "<br>";
    echo "<strong>Bookmark:</strong> " . $row["bookmark"] . "<br>";
    echo "<strong>PDF:</strong> " . $row["pdf"] . "<br>";
    echo "<strong>Bookmark Title:</strong> " . $row["bm_title"] . "<br>";
    echo "<strong>A Code:</strong> " . $row["acode"] . "<br>";
    echo "<strong>B Code:</strong> " . $row["bcode"] . "<br>";
    echo "<br><br>";
    echo "<hr>";
    echo "<br><br>";
  }
} else {
  echo "<strong>no results found</strong>";
}

// Close the database connection
$conn->close();
?>
