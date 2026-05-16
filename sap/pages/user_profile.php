<?php
session_start();

//$title_page = tb_workcentre;
$tbl_policy = "tb_workcentre";
$myfile = "tb_workcentre";

$filed1 = "id_wrkctv"; // id คีย์หลัก

//$id_edit = $_REQUEST['id_edit'];
//$id_edit = (isset($_REQUEST['id'])) ? $_REQUEST['id'] : '';
//if ($id_edit != '') {
    $strSQL = "SELECT * FROM $tbl_policy WHERE $filed1 ='".$_REQUEST['id_wrkctv']."';";
	//echo "mem_id=".$_SESSION['mem_id'];
	//echo "<br>sql=".$strSQL;
    $query = mysqli_query($link, $strSQL);
    $result = mysqli_fetch_array($query);
//}

if ($action == 'updatePass') {

	 if ($_POST['password_new_first'] != $_POST['password_new_second']) { 
		echo"<script language='JavaScript'>";
		echo"alert('ไม่สามารถแก้ไขรหัสผ่านได้ เนื่องจากยืนยันรหัสผ่านใหม่ไม่ตรงกัน');";
		//echo"alert('File not over 200 KB\n"+size+" KB');";
		echo "history.back()";
		echo"</script>";	
		exit();
	 }

	$strSQL1p = "UPDATE $tbl_policy SET ";
	$strSQL1p .="password = '".$_POST["password"]."' ";
	$strSQL1p .="WHERE id = '".$_SESSION['mem_id']."' ";
	$objQuery1p = mysqli_query($link,$strSQL1p) or die ("Error Query [".$strSQL1p."]");

	echo"<script language='JavaScript'>";
	echo"alert('เปลี่ยนรหัสผ่านเรียบร้อย');";
	//echo"alert('File not over 200 KB\n"+size+" KB');";
	//echo "history.back()";
	echo"</script>";	

	echo "<meta http-equiv='refresh' content='0;url=$PHP_SELF?module=profile_edit'>";

}


if ($action == 'update') {

//================ upload picture
$path="images/member/";	// พาสไฟล์อัพโหลด
ini_set("memory_limit","2M"); 
$maximgsize=1097152; //ขนาดภาพไม่เกิน 2 MB.
//$imgsize = ( $maximgsize / 1024 );
$maxfilesize=2097152; //ขนาดไม่เกิน 2 MB.
//$filesize = ( $maxfilesize / 1024 );
/// file1
$myfile1 = $_FILES ['picture'] ['tmp_name'] ;
$myfile1_name = $_FILES ['picture'] ['name'] ;
$myfile1_size = $_FILES ['picture'] ['size'] ;
$myfile1_type = $_FILES ['picture'] ['type'] ;

$array_last1 = explode("." ,$myfile1_name) ;
$c1 =count ($array_last1) - 1 ;
$lastname1 = strtolower ($array_last1 [$c1] ) ;

 if ($myfile1<>"") {
 
	 if ($lastname1 =="jpg" || $lastname1 =="gif" || $lastname1 =="png") { 
		 //echo "OK" ; 

		  if ($myfile1_size>$maximgsize) {
			  //echo "-ไฟล์ $myfile1_name มีขนาดใหญ่กว่าที่กำหนด<BR>" ;
				echo"<script language='JavaScript'>";
				echo"alert('ไฟล์ $myfile1_name มีขนาดใหญ่กว่าที่กำหนด');";
				//echo"alert('File not over 200 KB\n"+size+" KB');";
				echo "history.back()";
				echo"</script>";	
				exit();
			}
			
	  }else{
			//echo "ชนิดไฟล์ไม่ถูกต้อง";
			echo"<script language='JavaScript'>";
			echo"alert('ชนิดไฟล์ไม่ถูกต้อง');";
			//echo"alert('File not over 200 KB\n"+size+" KB');";
			echo "history.back()";
			echo"</script>";	
			exit();
	} //--- /if ($lastname1 =="jpg" || $lastname1 =="gif" || $lastname1 =="png") {
	  

	$myfile1name=$_SESSION["username"].".".$lastname1; 
	copy ($myfile1, $path.$myfile1name) ; 
	unlink ($myfile1) ;
	//==============================================
	$strSQL1 = "UPDATE tbl_system_user SET ";
	//$strSQL1 .="kname = '".$_POST["kname"]."' ";
	//$strSQL1 .=",name = '".$_POST["name"]."' ";
	//$strSQL1 .=",sname = '".$_POST["sname"]."' ";
	$strSQL1 .=",school = '".$_POST["school"]."' ";
	$strSQL1 .=",position = '".$_POST["position"]."' ";
	$strSQL1 .=",phone = '".$_POST["phone"]."' ";
	$strSQL1 .=",workgroup = '".$_POST["workgroup"]."' ";
	$strSQL1 .=",email = '".$_POST["email"]."' ";
	$strSQL1 .=",picture = '".$myfile1name."' ";
	$strSQL1 .=",date_save = '".date("Y-m-d H:i:s")."' ";
	$strSQL1 .="WHERE id = '".$_SESSION['mem_id']."' ";
	$objQuery1 = mysqli_query($link,$strSQL1) or die ("Error Query [".$strSQL1."]");

	echo"<script language='JavaScript'>";
	echo"alert('บันทึกข้อมูลเรียบร้อย');";
	//echo"alert('File not over 200 KB\n"+size+" KB');";
	//echo "history.back()";
	echo"</script>";	

	echo "<meta http-equiv='refresh' content='0;url=$PHP_SELF?module=user'>";


 }else{

	//==============================================
	$strSQL1 = "UPDATE $tbl_policy SET ";
	//$strSQL1 .="kname = '".$_POST["kname"]."' ";
	//$strSQL1 .=",name = '".$_POST["name"]."' ";
	//$strSQL1 .=",sname = '".$_POST["sname"]."' ";
	$strSQL1 .=",school = '".$_POST["school"]."' ";
	$strSQL1 .=",position = '".$_POST["position"]."' ";
	$strSQL1 .=",phone = '".$_POST["phone"]."' ";
	$strSQL1 .=",workgroup = '".$_POST["workgroup"]."' ";
	$strSQL1 .=",email = '".$_POST["email"]."' ";
	$strSQL1 .=",date_save = '".date("Y-m-d H:i:s")."' ";
	$strSQL1 .="WHERE id = '".$_SESSION['mem_id']."' ";
	$objQuery1 = mysqli_query($link,$strSQL1) or die ("Error Query [".$strSQL1."]");

	//echo "<br>sql=".$strSQL1;

	echo"<script language='JavaScript'>";
	echo"alert('บันทึกข้อมูลเรียบร้อย');";
	//echo"alert('File not over 200 KB\n"+size+" KB');";
	//echo "history.back()";
	echo"</script>";	

	echo "<meta http-equiv='refresh' content='0;url=$PHP_SELF?module=profile_edit'>";


 }//====== /if  ($myfile1<>"") {""

} // /if update
?>
<style>
    th{
        vertical-align:middle;
        text-align:center;
    }
</style>


<section class="content"> 

    <div class="row">
        <div class="col-lg-12 col-xs-12"> 
            <div class="box box-success">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-users"></i> ข้อมูลส่วนตัว 
                    </h3>
                </div>
                <br>

<!--แบบรับข้อมูล-->
<form class="form-horizontal" role="form" action="<?php $PHP_SELF ?>?module=profile_edit&action=update" method="post" enctype="multipart/form-data" name="update">      
                    <div class="container-fluid">
                        <div class="row">
                            <!-- left column -->
                            <div class="col-md-3">
                                <div class="text-center">
                                    <?php if ($result['picture'] == "") { ?>
                                        <img src="images/member/who.png" class="avatar" style="width: 200px;">
                                    <?php } else { ?>
                                        <img src="images/member/<?= $result['picture']; ?>" class="avatar" style="width: 200px;"><?= $result['picture']; ?>
                                    <?php } ?>

                                         <h6>กรุณาอัฟโหลดรูปถ่าย</h6>

                                         <input type="file" name="picture" class="btn btn-warning" style="width: 220px;" accept=".jpg,.jpeg,.png,.gif" />
                                </div>
                            </div>

                            <!-- edit form column -->
                            <div class="col-md-9 personal-info">
                                <!--            <div class="alert alert-info alert-dismissable">
                                              <a class="panel-close close" data-dismiss="alert">×</a> 
                                              <i class="fa fa-coffee"></i>
                                              This is an <strong>.alert</strong>. Use this to show important messages to the user.
                                            </div> -->


                                <!-- <div class="form-group">
                                    <label class="col-lg-3 control-label">คำนำหน้า (kname) :</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="กรุณาพิมพ์คำนำหน้า เช่น นาย นาง นางสาว" name="kname" value="<?php echo $result['kname']; ?>">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-lg-3 control-label">ชื่อ (name) :</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="กรุณาพิมพ์ชื่อ" name="name" value="<?php echo $result['name']; ?>">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-lg-3 control-label">นามสกุล (sname) :</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="กรุณาพิมพ์นามสกุล" name="sname" value="<?php echo $result['sname']; ?>">
                                    </div>
                                </div> -->

                                <div class="form-group">
                                    <label class="col-lg-3 control-label">ชื่อผู้ใช้ (position) :</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="กรุณาพิมพ์ตำแหน่ง" name="position" value="<?php echo $result['position']; ?>">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="col-lg-3 control-label">ตำแหน่ง (position) :</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="กรุณาพิมพ์ตำแหน่ง" name="position" value="<?php echo $result['position']; ?>">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="col-lg-3 control-label">กลุ่มงาน (workgroup) :</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="กลุ่มงาน" name="workgroup" value="<?php echo $result['workgroup']; ?>">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-lg-3 control-label">เบอร์โทร (phone) :</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="กรุณาพิมพ์เบอร์โทร เช่น 0818877797" name="phone" value="<?php echo $result['phone']; ?>">
                                    </div>
                                </div>
                                 <div class="form-group">
                                    <label class="col-lg-3 control-label">อีเมล์ (e-mail) :</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="กรุณาพิมพ์อีเมล์ เช่น somchai@lpg1.go.th" name="email" value="<?php echo $result['email']; ?>">
                                    </div>
                                </div>
                               <div class="form-group">
                                    <label class="col-md-3 control-label"></label>
                                    <div class="col-md-6">
		<button type="submit" id="" name="" class="btn btn-primary" tabindex="">
		<span class="glyphicon glyphicon-floppy-saved"></span> บันทึกข้อมูล</button>
<!-- <a href="javascript:history.back();"> --><a href="index.php"><button type="button" class="btn btn-warning" tabindex="">
		<span class="glyphicon glyphicon-floppy-remove"></span> ยกเลิก</button></a>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>


				</form>
            </div>
        </div>
    </div>

<!-- /////////////////////////////////////////////// -->
    <div class="row">
        <div class="col-lg-12 col-xs-12"> 
            <div class="box box-success">
                <div class="box-header with-border">
                    <h3 class="box-title"><i class="fa fa-users"></i> เปลี่ยนรหัสผ่าน 
                    </h3>
                </div>
                <br>

                <!--แบบรับข้อมูล-->
<form class="form-horizontal" role="form" action="<?php $PHP_SELF ?>?module=profile_edit&action=updatePass" method="post" enctype="multipart/form-data" name="updatePass">      
                    <div class="container-fluid">
                        <div class="row">
                            <!-- left column -->

                            <!-- edit form column -->
                            <div class="col-md-12 personal-info">

                                <div class="form-group">
                                    <label class="col-lg-3 control-label">รหัสผ่านเดิม</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="รหัสผ่านปัจจุบัน" name="current_password" value="<?php echo $result['password']; ?>">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-lg-3 control-label">รหัสผ่านใหม่</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="รหัสผ่านใหม่" name="password_new_first" value="">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-lg-3 control-label">ยืนยันรหัสผ่าน</label>
                                    <div class="col-lg-6">
                                        <input class="form-control" type="text" placeholder="ยืนยันรหัสผ่าน" name="password_new_second" value="">
                                    </div>
                                </div>

                               <div class="form-group">
                                    <label class="col-md-3 control-label"></label>
                                    <div class="col-md-6">
		<button type="submit" id="" name="" class="btn btn-success" tabindex="">
		<span class="glyphicon glyphicon-floppy-saved"></span> เปลี่ยนรหัสผ่าน</button>
<!-- <a href="javascript:history.back();"> --><a href="index.php"><button type="button" class="btn btn-warning" tabindex="">
		<span class="glyphicon glyphicon-floppy-remove"></span> ยกเลิก</button></a>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>


				</form>
            </div>
        </div>
    </div>
<!-- /////////////////////////////////////////////// -->
</section>

