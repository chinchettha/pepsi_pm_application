<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_functional.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "แก้ไขข้อมูล";
$tbl_policy = "tbconfirmcom";
$myfile = "W_confirm_form";

$filed1 = "idcom"; // id คีย์หลัก
$filed2 = "idiw37";
$filed3 = "comdetail";
$filed4 = "wkctr";
$filed5 = "cfname";

include('../include/connection.php');
$strSQL = " SELECT * FROM $tbl_policy where $filed1 ='".$_REQUEST[$filed1]."';";
//echo $strSQL;
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query);
?>

<div id="app" class="">

	<form role="form" method="POST" action="<?php $PHP_SELF ?>?module=W_confirm_form&idcom=<?php echo $_REQUEST['idcom'];?>&idplanw=<?php echo $_REQUEST['idplanw'];?>&idiw37=<?php echo $_REQUEST['idiw37'];?>&wkorder=<?php echo $_REQUEST['wkorder'];?>"> 
	<input type="HIDDEN" name="idcom" value="<?php echo $_REQUEST['idcom'];?>">

		<div class="modal-header">
			<h5 class="modal-title" id="exampleModalLabel">
			<?php if ($_REQUEST['op']=="edit"){
				echo "<i class='far fa-edit nav-icon'></i>&nbsp;<span>แก้ไขข้อมูล </span>";
			}elseif ($_REQUEST['op']=="del"){
				echo "<i class='fa fa-trash nav-icon'></i>&nbsp;<span>ลบข้อมูล</span>";
			}else{
				echo "<i class='far fa-id-card nav-icon'></i>&nbsp;<span>เพิ่มข้อมูล</span>";
			}
			?>		
			</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>

		<div class="modal-body">

				<!-- <div class="form-group">
					<label for="<?php echo $filed1;?>">
						<span class="text-secondary"><?php echo $filed1;?> *</span>
					</label>
					<input type="text" name="<?php echo $filed1;?>" value="<?php echo $result[$filed1];?>" v-model="item.<?php echo $filed1;?>" class="form-control" autocomplete="off" maxlength="" readonly/>
				</div>
				<div class="form-group">
					<label for="<?php echo $filed2;?>">
						<span class="text-secondary"><?php echo $filed2;?> *</span>
					</label>
					<input type="text" name="<?php echo $filed2;?>" value="<?php echo $result[$filed2];?>" v-model="item.<?php echo $filed2;?>" class="form-control" autocomplete="off"  />
				</div> -->

				<div class="form-group">
					<label for="<?php echo $filed3;?>">
						<span class="text-secondary">รายการเพิ่มเติมรายละเอียดการปิดงาน *</span>
					</label>
					<!-- <input type="text" name="<?php echo $filed3;?>" value="<?php echo $result[$filed3];?>" v-model="item.<?php echo $filed3;?>" class="form-control" autocomplete="off"  /> -->
					<textarea name="comdetail" class="form-control" rows="5" placeholder="Enter ..." required><?php echo $result['comdetail'];?></textarea>
				</div>
				<!-- <div class="form-group">
					<label for="<?php echo $filed4;?>">
						<span class="text-secondary" v-if="item.id == 0"><?php echo $filed4;?> *</span>
					</label>
					<input type="<?php echo $filed4;?>" name="<?php echo $filed4;?>" value="<?php echo $result[$filed4];?>" id="<?php echo $filed4;?>" v-model="item.<?php echo $filed4;?>" class="form-control" autocomplete="off"  />
				</div> -->

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
				echo "<input type='hidden' name='op' value='edit_comment'>";
				echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-primary btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;แก้ไขข้อมูล&nbsp;</button>";
			}elseif ($_REQUEST['op']=="del"){
				echo "<input type='hidden' name='op' value='del_comment'>";
				echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-warning btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;ยืนยันลบข้อมูล&nbsp;</button>";
			}else{
				echo "<input type='hidden' name='op' value='save'>";
				echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-primary btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;เพิ่มข้อมูล&nbsp;</button>";
			}
			?>
		</div>

	</form>
</div>


