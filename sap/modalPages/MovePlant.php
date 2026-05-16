<?php
session_start();
// Include File connect Database
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
require_once('../include/define.php');



if(!empty($_POST["Event"][0]) && !empty($_POST["Event"][1])  ){
	$id = $_POST["Event"][0];
	$reson = $_POST["Event"][2];
	//แปลงวันที่ MkTime ย้าย
	$start = explode('.', $_POST["Event"][1]) ;
	if($start){
		$Start = mktime(0,0,0,$start[1],$start[0],$start[2]);
	}
	//แปลงวันที่ MkTime
	$dayNow = mktime(date("H"), date("i"), date("s"), date("m"),date("d"), date("Y")); // วัน เวลา ปัจจุบันแบบ mktime	
	$idwkctr = $_SESSION['wkctr']; // member id ผู้ย้าย
	
	//Update 170963
	//เช็คสถานะว่าสามารถย้ายได้หรือป่าว
	$sqlSyst = " SELECT  idiw37, syst from tbiw37n where idiw37 = '".$id."'  ";
	$querySyst = mysqli_query($link, $sqlSyst) or die ("Error Query [".$sqlSyst."]");
	$totalSyst = mysqli_num_rows($querySyst);
	$rowSyst = mysqli_fetch_array($querySyst);
	if($rowSyst["syst"] == "CRTD" || $rowSyst["syst"] == "REL"   ) { //เช็คสถานะว่าย้ายได้หรือป่าว
	//update 170963

	$strSQL = " SELECT * FROM  tbmoveplan  where idiw37='$id' ";
	$querySQL = mysqli_query($link, $strSQL) or die ("Error Query [".$strSQL."]");
	$totalRecords = mysqli_num_rows($querySQL);
	
	if($totalRecords >0){ //เช็คว่ามีข้อมูลการย้ายหรือยัง
		$rowSQL = mysqli_fetch_array($querySQL);
		$n = $rowSQL["mpcount"] + 1;
		$strUP = " UPDATE tbmoveplan 
					SET `cday` = '$Start', `mday` = '$dayNow', `mwkctr` = '$idwkctr', `reasoncode` = '$reson', `resoncom` = '', `mpcount` = '$n'
					WHERE idiw37='$id' ";
		$queryUP = mysqli_query($link, $strUP) or die ("Error Query [".$strUP."]");	
		if($queryUP>0){
			die ('Move Plan Success');
		}else{
			die ('Move Plan Unsuccessful');
		}	
		
	}else{ //ถ้าไม่พบข้อมูลให้เพิ่มใหม่
		$strAdd = " INSERT INTO `tbmoveplan`(`cday`, `idiw37`, `mday`, `mwkctr`, `reasoncode`, `resoncom`, `mpcount`)
					VALUES ('$Start', '$id', '$dayNow', '$idwkctr', '$reson', '', '1') ";
		$queryAdd = mysqli_query($link, $strAdd) or die ("Error Query [".$strAdd."]");	
		if($queryAdd>0){
			die ('Move Plan Success');
		}else{
			die ('Move Plan Unsuccessful');
		}	
	} //end เช็คว่ามีข้อมูลการย้ายหรือยัง

	//update 170963
	} else{ //ปิดเช็คสถานะว่าย้ายได้หรือป่าว
		die ("Status Plan don't Move ");
	} //ปิดเช็คสถานะว่าย้ายได้หรือป่าว
	//update 170963

} else{
	die ('Move Plan Unsuccessful');
} //if(!empty($_POST["Event"][0]) && !empty($_POST["Event"][1])  )


?>
