<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_iw37n.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/
date_default_timezone_set("Asia/Bangkok");
require_once('../include/connection.php');
require_once('../include/define.php');
require_once('../include/function.php');


$title_page = "ข้อมูลนำเข้า Equipment Form SAP";
$tbl_policy = "tbequipment";
$myfile = "M_equipment";
$numfiled = 8; //จำนวนฟิวในตาราง

//*******   กำหนดค่าแสดงในฟอร์ม  $filed[?] = "Field,Label,ชนิด D=วันที่  หรือ FK=FOREIGN KEY:tb:Field return ,R=required,H=hidden,IC=include File:Filename";   */
$filed[1] = "equipment"; // id คีย์หลัก
$filed[2] = "equipment,Equipment,,R";
$filed[3] = "equdescrip,Description,,R";
$filed[4] = "equipmentsub, Equipment Sub";
$filed[5] = "functionalloc,Functional loc.";
$filed[6] = "equl,L";
$filed[7] = "equ1,1";
$filed[8] = "equea,EA/CT";
//*******   กำหนดค่าแสดงในฟอร์ม  $filed[?] = "Field,Label,ชนิด D=วันที่  หรือ FK=FOREIGN KEY:tb:Field return ,R=required,H=hidden,IC=include File:Filename";   */


$id = $filed[1]; 
$strSQL = " SELECT * FROM $tbl_policy where $id='".$_GET["$id"]."' ";
//echo $strSQL;
$query = mysqli_query($link, $strSQL) or die ("Error Query [".$strSQL."]") ;
$result = mysqli_fetch_array($query);

?>

<div id="app" class="">
	<!-- <form role="form" method="GET" >  -->
	<!-- <form role="form" method="GET" action="pages/tb_equipment_form_process.php"> -->
	<!-- <form role="form" method="GET" action="<?php $PHP_SELF ?>?module=tb_functional">  -->
	<form role="form" method="POST" action="<?php $PHP_SELF ?>?module=<?php $myfile ?>"> 

		<div class="modal-header">
			<h5 class="modal-title" id="exampleModalLabel">
			<?php if ($_REQUEST['op']=="edit"){
				echo "<i class='far fa-edit nav-icon'></i>&nbsp;<span>แก้ไข $title_page</span>";
			}elseif ($_REQUEST['op']=="del"){
				echo "<i class='fa fa-trash nav-icon'></i>&nbsp;<span>ลบข้อมูล $title_page</span>";
			}else{
				echo "<i class='far fa-id-card nav-icon'></i>&nbsp;<span>เพิ่ม $title_page</span>";
			}
			?>
			</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>

		<div class="modal-body">

			<div class="input-group mb-3">
					
				<?PHP include_once("show_form.php"); //แสดงฟอร์มรับข้อมูล	?>
	
		</div>

		<div class="modal-footer">
			<input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
			<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
			<input type="hidden" name="module" value="<?php echo $myfile; ?>">
		
			<!-- <input type="hidden" name="op" value="save"> -->
			<!-- <button type="submit" class="btn btn-success" name="submit"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกข้อมูล&nbsp;</button> -->
			<button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fa fa-times nav-icon"></i>&nbsp;ยกเลิก&nbsp;</button>
			<!-- <button type="submit" name="Submit" v-on:click.prevent="submitData()" class="btn btn-primary btn-save"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึก&nbsp;</button> -->
			<?php if ($_REQUEST['op']=="edit"){
				echo "<input type='hidden' name='op' value='save'>";
				echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-primary btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;แก้ไขข้อมูล&nbsp;</button>";
			}elseif ($_REQUEST['op']=="del"){
				echo "<input type='hidden' name='op' value='del'>";
				echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-warning btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;ลบข้อมูล&nbsp;</button>";
			}else{
				echo "<input type='hidden' name='op' value='save'>";
				echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-primary btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;เพิ่มข้อมูล&nbsp;</button>";
			}
			?>
		</div>

	</form>
</div>