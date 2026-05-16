<?php

session_start();
// Include File connect Database
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
//require_once('../include/define.php');
$tbl_policy = "view_order";
?>
<script src="plugins/sweetalert/dist/sweetalert.js"></script>
<link rel="stylesheet" href="plugins/sweetalert/dist/sweetalert.css">

<?PHP  
if(!empty($_POST["Event"][0]) && !empty($_POST["Event"][1])  ){
	$idiw37 = $_POST["Event"][0];
    $team = $_POST["Event"][1];
    $TxtSearch = $_POST["Event"][2];
    $strAdd = " UPDATE `tbiw37n` SET `team` = '$team' WHERE `idiw37` = '$idiw37'  ";
    $queryAdd = mysqli_query($link, $strAdd) or die ("Error Query [".$strAdd."]");
    echo "<script>swal('เพิ่มงานให้ Team $team', 'สำเร็จ!', 'success')</script>";	
}

  
include_once("FilterDetail_AddTeam.php"); //แสดงรายละเอียดผลการค้นหา   

?>

