<?php
session_start();

$uip=$_SERVER['REMOTE_ADDR']; // get the user ip
$myip=getHostByName(getHostName());	//PHP >= 5.3.0

$action="out";
// query for inser user log in to data base
$query=mysqli_query($link,"insert into tbworkcenter_userlog(userId,username,userIp,myIp,action) values('".$_SESSION['mem_id']."','".$_SESSION['username']."','$uip','$myip','$action')");


unset($_SESSION['mem_id']);
//session_unset();
session_destroy();
	echo "<meta http-equiv='refresh' content='0;url=".$PHP_SELF."index.php' />";
	//header( "location:index.php" );
 exit(0);
?>
