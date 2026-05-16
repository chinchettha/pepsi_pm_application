<?php
session_start();
include('../include/connection.php');
$strSQL = " SELECT * FROM tbl_member where id ='".$_SESSION['mem_id']."';";
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query);
?>
<div id="app" class="">
	<form role="form" id="modalForm" method="post" action="pages/member_chk_password.php" >
		<input type="hidden" name="action" value="update">
		<div class="modal-header">
			<h5 class="modal-title" id="exampleModalLabel">
				<!-- <span v-if="item.id == 0">แก้ไข</span> -->
				<span v-else>แก้ไขรหัสผ่าน : <?php echo $result['fullname'];?></span>				
			</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
		<div class="modal-body">
			<!-- <form> -->
				<input type="hidden" name="id" value="0" />
				<div class="form-group">
					<label for="idcard">
						<span class="text-secondary">เลขบัตรประจำตัวประชาชน*</span>
					</label>
					<input type="text" name="idcard" value="<?php echo $result['idcard'];?>" v-model="item.idcard" class="form-control" autocomplete="off" readonly/>
				</div>
				<div class="form-group">
					<label for="fullname">
						<span class="text-secondary">ชื่อ-นามสกุล*</span>
					</label>
					<input type="text" name="fullname" value="<?php echo $result['fullname'];?>" v-model="item.fullname" class="form-control" autocomplete="off" readonly/>
				</div>
				<div class="form-group">
					<label for="username">
						<span class="text-secondary">ชื่อผู้ใช้งาน*</span>
					</label>
					<input type="text" name="username" value="<?php echo $result['username'];?>" v-model="item.username" class="form-control" autocomplete="off" readonly/>
				</div>
				<div class="form-group">
					<label for="password-old">
						<span class="text-secondary" v-if="item.id == 0">รหัสผ่านเดิม*</span>
					</label>
					<input type="password" name="password-old" value="" id="password-old" v-model="item.password-old" class="form-control" autocomplete="off" required />
				</div>
				<div class="form-group">
					<label for="password-old">
						<span class="text-secondary" v-if="item.id == 0">รหัสผ่านใหม่*</span>
					</label>
					<input type="password" name="password-new" value="" id="password-new" v-model="item.password-new" class="form-control" autocomplete="off"  required/>
				</div>
				<div class="form-group">
					<label for="confpassword">
						<span class="text-secondary" v-if="item.id == 0">ยืนยันรหัสผ่านใหม่*</span>
					</label>
					<input type="password" name="confpassword" value="" class="form-control" autocomplete="off"  required/>
				</div>
				<div class="form-group">
					<label for="usertype">
						<span class="text-secondary">ประเภทผู้ใช้งาน*</span>
					</label>
					<select name="usertype" v-model="item.usertype" class="form-control">
						<option value="" selected="selected">สมาชิก</option>
						<!-- <option value="ADMIN">Admin</option>
						<option value="USER">User</option> -->
					</select>
				</div>
				<div class="form-group">
					<!-- <label><input type="checkbox">สถานะ</label> -->
					<div class="icheck-primary">
					  <input type="checkbox" id="remember" checked>
					  <label for="remember">
						สถานะ
					  </label>
					</div>

				</div>
			<!-- </form> -->
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-secondary" data-dismiss="modal">				ปิด</button>
			<button type="submit" v-on:click.prevent="submitData()" class="btn btn-primary btn-save">
			บันทึก</button>
		</div>
	</form>
</div>

<?php
if ($_POST['action'] == 'update2') {
	// ตรวจรหัสเดิม
	$strSQL2 = "SELECT password FROM tbl_member where id ='".$_SESSION['mem_id']."';";
	$query2 = mysqli_query($link, $strSQL2);
	$result2 = mysqli_fetch_array($query2);

	if ($result2['password'] <> $_POST['password-old']){
			//die("<script> 
			//alert('คำเตือน!! รหัสผ่านเดิมไม่ถูกต้อง!!');
			//history.back();
			//</script>");
			echo"<script language='JavaScript'>";
			echo"alert('คำเตือน!! รหัสผ่านเดิมไม่ถูกต้อง!!'');";
			echo "history.back()";
			echo"</script>";
			exit();
	}
	// ตรวจยืนยันรหัสผ่าน
	if ($_POST['password-new'] <> $_POST['confpassword']){
			//die("<script> 
			//alert('คำเตือน!! ยืนยันรหัสผ่านไม่ถูกต้อง!!');
			//history.back();
			//</script>");
			echo"<script language='JavaScript'>";
			echo"alert('คำเตือน!! ยืนยันรหัสผ่านไม่ถูกต้อง!!'');";
			echo "history.back()";
			echo"</script>";
			exit();
	}

$strSQL = "UPDATE tbl_member SET ";
$strSQL .="password = '".$_POST["confpassword"]."' ";
//$strSQL .=",username = '".$_POST["username"]."' ";
//$strSQL .=",fullname = '".$_POST["fullname"]."' ";
//$strSQL .=",bank = '".$_POST["bank"]."' ";
//$strSQL .=",bank_branch = '".$_POST["bank_branch"]."' ";
//$strSQL .=",bank_no = '".$_POST["bank_no"]."' ";
$strSQL .="WHERE id = '".$_SESSION['mem_id']."' ";
$objQuery = mysqli_query($link,$strSQL) or die ("Error Query [".$strSQL."]");

echo"<script language='JavaScript'>";
echo"alert('บันทึกข้อมูลเรียบร้อย');";
echo "history.back()";
echo"</script>";	
echo "<meta http-equiv='refresh' content='0;url=index.php?module=profile'>";
}
?>
