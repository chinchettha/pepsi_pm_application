<?php
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
