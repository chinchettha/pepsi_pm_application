<?php

session_start();
// Include File connect Database
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
require_once('../include/define.php');
?>
<script src="plugins/sweetalert/dist/sweetalert.js"></script>
<link rel="stylesheet" href="plugins/sweetalert/dist/sweetalert.css">

<?PHP  

if(!empty($_POST["Event"][0]) && !empty($_POST["Event"][1]) && !empty($_POST["Event"][2])  ){
	$idiw37 = $_POST["Event"][0];
	$wkctr = $_POST["Event"][1];
	$st = $_POST["Event"][2];
	$pwteam = $_POST["Event"][3];
	$wkctrpw = $_SESSION['wkctr']; // member id Login

	$dayNow = mktime(date("H"), date("i"), date("s"), date("m"),date("d"), date("Y")); // วัน เวลา ปัจจุบันแบบ mktime	
	
	
if($st == "Add") { //เพิ่มข้อมูล Table tbplaningwork

	$strSQL = " SELECT * FROM  tbplangingwork  where idiw37='$idiw37' and wkctr='$wkctr' ";
	$querySQL = mysqli_query($link, $strSQL) or die ("Error Query [".$strSQL."]");
	$totalRecords = mysqli_num_rows($querySQL);
	
	if($totalRecords >0){ //เช็คว่ามีข้อมูลการย้ายหรือยัง
		echo "<script>swal('รหัสพนักงานนี้มีอยู่แล้ว!', 'โปรดตรวจสอบ!', 'warning')</script>";
	//	echo "<script> alert('รหัสพนักงานนี้มีอยู่แล้ว กรุณาตรวจสอบ'); </script>";		
	}else{ //ถ้าไม่พบข้อมูลให้เพิ่มใหม่
		if(trim($pwteam)== "G"){  // เช็คว่าเป็นการเพิ่มแบบกลุ่มหรือป่าว
			$sqlG = " SELECT  * from tbworkcenter where  idwkctrgroup = ' $wkctr'    ";
			$queryG = mysqli_query($link, $sqlG) or die ("Error Query [".$sqlG."]");	
			while($rsG = mysqli_fetch_array($queryG) ){
				//chek Add Plan ซ้ำ
				$SQLc = " SELECT * FROM  tbplangingwork  where idiw37='$idiw37' and wkctr='$rsG[wkctr]' ";
				$queryC = mysqli_query($link, $SQLc) or die ("Error Query [".$SQLc."]");
				$totalc = mysqli_num_rows($queryC);
				if($totalc <= 0 ){
					$strAdd = " INSERT INTO  tbplangingwork (`wkctr`, `idiw37`, `wkctrpw`, `pwcomment`,pwteam) 
								VALUES ('$rsG[wkctr]', '$idiw37', '$wkctrpw', '$dayNow','P') ";
					$queryAdd = mysqli_query($link, $strAdd) or die ("Error Query [".$strAdd."]");						
				}else{
					echo "<script>swal('$rsG[wkctr] รหัสพนักงานนี้มีอยู่แล้ว!', 'โปรดตรวจสอบ!', 'warning')</script>";
				}
				//ปิด check Add Plan ซ้ำ				
			} //end while($rsG = mysqli_fetch_array($queryG) ){

		} else{
			$strAdd = " INSERT INTO  tbplangingwork (`wkctr`, `idiw37`, `wkctrpw`, `pwcomment`,pwteam) 
						VALUES ('$wkctr', '$idiw37', '$wkctrpw', '$dayNow','$pwteam') ";
			$queryAdd = mysqli_query($link, $strAdd) or die ("Error Query [".$strAdd."]");
		} // end if(trim($pwteam)== "G"){


		if($queryAdd>0){
			//echo "<script> alert('Add Plan Success'); </script>";
		}else{
			echo "<script>swal('Add Plan Unsuccessful!', 'โปรดตรวจสอบ!', 'warning')</script>";
			//echo "<script> alert('Add Plan Unsuccessful'); </script>";
		}	
	} //end เช็คว่ามีข้อมูลการย้ายหรือยัง
} // end if //เพิ่มข้อมูล Table tbplaningwork

if($st == "Del"){ //ลบข้อมูล Table tbplaningwork

	$SQLdel = " DELETE FROM tbplangingwork WHERE `idplanw` = '$wkctr' ";
	$queryDel = mysqli_query($link, $SQLdel) or die ("Error Query [".$SQLdel."]");	
		if($queryDel>0){
			echo "<script>swal('ลบข้อมูลเรียบร้อย!', 'Del Plan Success!', 'success')</script>";
			//echo "<script> alert('Del Plan Success'); </script>";
		}else{
			echo "<script> alert('Del Plan Unsuccessful'); </script>";
		}	
} //ลบข้อมูล Table tbplaningwork

} else{
	echo "<script> alert('Add Plan Unsuccessful'); </script>";
} //if(!empty($_POST["Event"][0]) && !empty($_POST["Event"][1])  )

include_once("ShowPlan.php");
?>

