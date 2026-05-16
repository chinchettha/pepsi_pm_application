<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_workcentretype.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "ข้อมูลหน่วยงาน";
$tbl_policy = "tbdepartment";
$myfile = "tbdepartment";

$filed1 = "iddepartment"; // id คีย์หลัก
$filed2 = "department";

include('../include/connection.php');
$strSQL = " SELECT * FROM $tbl_policy where iddepartment ='".$_REQUEST['iddepartment']."';";
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query);
?>

<div id="app" class="">
	<!-- <form role="form" method="GET" >  -->
	<!-- <form role="form" method="GET" action="pages/tb_equipment_form_process.php"> -->
	<!-- <form role="form" method="GET" action="<?php $PHP_SELF ?>?module=tb_functional">  -->
	<form role="form" method="POST" action="<?php $PHP_SELF ?>?module=tbdepartment"> 

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

				<!-- <div class="form-group">
					<label for="iddepartment">
						<span class="text-secondary">iddepartment *</span>
					</label>
					<input type="text" name="iddepartment" value="<?php echo $result['iddepartment'];?>" v-model="item.iddepartment" class="form-control" autocomplete="off" maxlength=""/>
				</div>
				<div class="form-group">
					<label for="department">
						<span class="text-secondary">department *</span>
					</label>
					<input type="text" name="department" value="<?php echo $result['department'];?>" v-model="item.department" class="form-control" autocomplete="off"  />
				</div> -->

				<div class="input-group mb-3">
					<div class="input-group-prepend" >
						<span class="btn btn-info" style="width: 180px; text-align: right;"><i class='fa fa-key nav-icon'></i>iddepartment *</span>
					</div>
					<input type="text" class="form-control text-danger bg-light" placeholder="" id="iddepartment" name="iddepartment" value="<?php echo $result['iddepartment'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="iddepartment" style="font-weight:bold;" required>
				</div>
				<div class="input-group mb-3">
					<div class="input-group-prepend" >
						<span class="btn btn-info" style="width: 180px; text-align: right;">department *</span>
					</div>
					<input type="text" class="form-control" placeholder="" id="department" name="department" value="<?php echo $result['department'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="department" required>
				</div>


				<!-- <div class="form-group">
					<input type="hidden" name="op" value="save">
					<button type="submit" name="Submit" class="btn btn-success float-right"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกข้อมูล&nbsp;</button>
				</div> -->
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

