<?php
session_start();
// Include File connect Database
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
require_once('../include/define.php');


//หาระยะเวลาทำงาน
function duration($begin,$end){
    $remain=intval(strtotime($end)-strtotime($begin));
    $wan=floor($remain/86400);
    $l_wan=$remain%86400;
    $hour=floor($l_wan/3600);
    $l_hour=$l_wan%3600;
    $minute=floor($l_hour/60);
    $second=$l_hour%60;
    //return "ผ่านมาแล้ว ".$wan." วัน ".$hour." ชั่วโมง ".$minute." นาที ".$second." วินาที";
	$min = ($wan*1440) + ($hour*60) + $minute;
	/*** ปิดแปลงเป็น ชม.
    if($min > 60){
        $min1 = $min/60;
        $min1 =  round($min1, 2); 
        $unit = "H";
    }else{
        $min1 = $min;
        $unit = "Min";
	}
	/*** ปิดแปลงเป็น ชม. ***/
	$min1 = $min;
    $unit = "Min";
    return array( $min1, $unit ); 
}
//หาระยะเวลาทำงาน


if(!empty($_POST["Event"][0]) && !empty($_POST["Event"][1]) && !empty($_POST["Event"][2])  ){
	$idiw37 = $_POST["Event"][0];
	$wkctr = $_POST["Event"][1];
	$startD = $_POST["Event"][2];
	$startT = $_POST["Event"][3];
	$endD = $_POST["Event"][4];
	$endT = $_POST["Event"][5];
	$st = $_POST["Event"][6];
	$wkctrpw = $_SESSION["wkctr"]; // member id Login

	$dayNow = mktime(date("H"), date("i"), date("s"), date("m"),date("d"), date("Y")); // วัน เวลา ปัจจุบันแบบ mktime	
	//หาวันเวลา เริ่มงาน
	if(!empty(trim($startD)) && !empty(trim($startT)) ){ 
		$startD = explode(".", $startD ); 
		$startT = explode(":" ,$startT);
		$stdate = mktime($startT[0], $startT[1], 0, $startD[1], $startD[0], $startD[2]); 
	}

	if(!empty(trim($endT)) && !empty(trim($endT)) ){ 
		$endD = explode(".", $endD ); 
		$endT = explode(":" ,$endT);
		$endate = mktime($endT[0], $endT[1], 0, $endD[1], $endD[0], $endD[2]); 
	}
	//หาวันเวลา เริ่มงาน

	//หาระยะเวลาการทำงาน
	list($a, $b) = duration(date("Y-m-d H:i:s",$stdate),date("Y-m-d H:i:s",$endate));
	//หาระยะเวลาการทำงาน


	
if($st == "Add") { //เพิ่มข้อมูล Table tbplaningwork

	$strSQL = " SELECT * FROM  tbwrkclose  where idiw37='$idiw37' and wkctr='$wkctr' ";
	$querySQL = mysqli_query($link, $strSQL) or die ("Error Query [".$strSQL."]");
	$totalRecords = mysqli_num_rows($querySQL);
	
	if($totalRecords >0){ //เช็คว่ามีข้อมูลการย้ายหรือยัง
		echo "<script>swal('ท่านได้ทำการปิดงานไปแล้ว!', 'โปรดตรวจสอบ!', 'warning')</script>";
		//echo "<script> alert('ท่านได้ทำการปิดงานไปแล้ว กรุณาตรวจสอบ'); </script>";		
	}else{ //ถ้าไม่พบข้อมูลให้เพิ่มใหม่
		$strAdd = "	INSERT INTO `tbwrkclose` (`idiw37`, `cstdate`, `cendate`, `wkctr`, `wktimeclose`, `wktimewk`, `wkunit`)
					VALUES ('$idiw37', '$stdate', '$endate', '$wkctr', '$dayNow', '$a', '$b') ";
		$queryAdd = mysqli_query($link, $strAdd) or die ("Error Query [".$strAdd."]");	
		if($queryAdd>0){
			//echo "<script> alert('Add Plan Success '); </script>";
		}else{
			echo "<script> alert('Add Confrim Unsuccessful'); </script>";
		}	
	} //end เช็คว่ามีข้อมูลการย้ายหรือยัง
} // end if //เพิ่มข้อมูล Table tbplaningwork

if($st == "Del"){ //ลบข้อมูล Table tbplaningwork

	$SQLdel = " DELETE FROM tbwrkclose WHERE `idwrkclose` = '$wkctr' ";
	$queryDel = mysqli_query($link, $SQLdel) or die ("Error Query [".$SQLdel."]");	
		if($queryDel>0){
			//echo "<script> alert('Del Plan Success'); </script>";
		}else{
			echo "<script> alert('Del Confrim Unsuccessful'); </script>";
		}	
} //ลบข้อมูล Table tbplaningwork

} else{
	echo "<script> alert('Add Confirm Unsuccessful'); </script>";
} //if(!empty($_POST["Event"][0]) && !empty($_POST["Event"][1])  )

include_once("plan_ShowClose.php");
?>

