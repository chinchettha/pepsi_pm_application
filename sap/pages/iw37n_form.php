<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_iw37n.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "ข้อมูลนำเข้า IW37N From SAP";
$tbl_policy = "tbiw37n";
$myfile = "iw37n";
$numfiled = 21; //จำนวนฟิวในตาราง

$filed[1] = "idiw37"; // id คีย์หลัก
$filed[2] = "mntplan";
$filed[3] = "wkorder";
$filed[4] = "wktype";
$filed[5] = "mat";
$filed[6] = "bscstart";
$filed[7] = "actfinish";
$filed[8] = "systemstatus";
$filed[9] = "syst";
$filed[10] = "opac";
$filed[11] = "operationshorttext";
$filed[12] = "ostdescription";
$filed[13] = "cknow";
$filed[14] = "wkctr";
$filed[15] = "work";
$filed[16] = "actwork";
$filed[17] = "untime";
$filed[18] = "equipment";
$filed[19] = "equdescrip";
$filed[20] = "functionalloc";
$filed[21] = "funcdescrip";

include_once('../include/connection.php');
$id = $filed[1];
$strSQL = " SELECT * FROM $tbl_policy where $id='".$_GET["$id"]."' ";
//echo $strSQL;
$query = mysqli_query($link, $strSQL);
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
				echo "<i class='far fa-edit nav-icon'></i>&nbsp;<span>แก้ไขข้อมูล $title_page</span>";
			}elseif ($_REQUEST['op']=="del"){
				echo "<i class='fa fa-trash nav-icon'></i>&nbsp;<span>ลบข้อมูล $title_page</span>";
			}else{
				echo "<i class='far fa-id-card nav-icon'></i>&nbsp;<span>เพิ่มข้อมูล $title_page</span>";
			}
			?>
			</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>

		<div class="modal-body">

			<div class="input-group mb-3">
					
				<?PHP 
					for($i=2;$i<=$numfiled;$i++){
						$Filed = $filed[$i];
						?>
						<div class="input-group mb-3">
						<div class="input-group-prepend" >
							<span class="btn btn-info" style="width: 180px; text-align: right;"><?php echo $Filed;?> </span>
						</div>
							<input type="text" class="form-control " placeholder="" id="<?php echo $Filed;?>" name="<?php echo $Filed;?>" value="<?php echo $result[$Filed];?>" data-toggle="tooltip"  data-placement="top" title="<?php echo $Filed;?>" style="font-weight:bold;" >
						</div>	
						<?PHP 
					} // end for($i=1;$i<=$numfiled;$i++)
				?>
	
		</div>

		<div class="modal-footer">
			<input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
			<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
			<input type="hidden" name="module" value="<?php echo $myfile; ?>">
			<input type="hidden" name="<?php echo $id; ?>" value="<?php echo $_GET["$id"]; ?>">
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