<html>
    <body><?php
// page1.php

session_start();

echo 'Welcome to page #1';

// Works if session cookie was accepted
echo '<br /><a href="page2.php">page 2</a>';

// Or maybe pass along the session id, if needed
echo '<br />'.$_SESSION['pippo'];
?>
SERVER 1
<form method="POST" action="page2.php">
    <button type="submit">ok</button>
</form>
<a href="page2.php">angelo</a>
</body>
</html>
