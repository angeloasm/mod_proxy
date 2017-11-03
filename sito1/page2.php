<?php
session_start();
session_unset();
$_SESSION['pippo']='pippo'
?>
<!DOCTYPE html>
<html>
<body>

<?php
print_r($_SESSION);
?>

</body>
</html>