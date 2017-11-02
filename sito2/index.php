<html>
    <body><?php
// page1.php
session_start();


// Works if session cookie was accepted
echo '<br /><a href="page2.php">page 2</a>';

// Or maybe pass along the session id, if needed
?>
SERVER 2 Elimino
<a href="page2.php"><?php echo $_SESSION['angelo'];?></a>
</body>
</html>
