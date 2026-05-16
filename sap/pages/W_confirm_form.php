<?php
//include('../include/connection.php');
$title_page = "Add image";
//$tbl_policy = "tbworkcenter";
$myfile = "W_confirm_form";


$_SESSION['idplanw'] = $_REQUEST['idplanw'];  // รหัส idplanw
$_SESSION['idiw37'] = $_REQUEST['idiw37']; //รหัส idiw37
$_SESSION['wkorder'] = $_REQUEST['wkorder']; //รหัส wkorder

/*
$strSQL = " select * from view_order where wkorder='$_REQUEST['wkorder']' ";
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query);
//echo $strSQL;
*/
?>

<?php
//$Lineday = explode(".", date("d.m.Y H:i:s");          
//$mkdate = mktime(0, 0, 0, date("d"), date("m"), date("Y"));  
//echo $mkdate;
//$CVmkdate = date("d.m.Y", $mkdate);  
//echo "<br>".$CVmkdate;

//$record_date2 = date("d.m.Y H:i:s");
//$record_date = date("Y-m-d H:i:s");
//$record_date = date("d.m.Y", mktime(0, 0, 0, date("d"), date("m"), date("Y")));  
$record_date = mktime(0, 0, 0, date("d"), date("m"), date("Y"));  

//กำหนดเปลี่ยนแปลงชื่อไฟล์ภาพ
//$random_img = date(Ymd) . time();
//$rename_img = $_SESSION['idiw37']."_".$_SESSION['wkctr']."_".$random_img;
//echo $rename_img;

//--------------------------- แบบที่ 1

//หากมีการกดปุ่มบันทึก
if ($_REQUEST['op'] == "insert_img") {

	//----- ย่อขนาดภาพ
		if(trim($_FILES["fileUpload"]["tmp_name"]) != "")
		{

			//กำหนดเปลี่ยนแปลงชื่อไฟล์ภาพ
			$random_img = date(Ymd) . time();
			$rename_img = $_SESSION['idiw37']."_".$_SESSION['wkctr']."_".$random_img;
			//echo $rename_img;

			//หานามสกุลไฟล์
			$extension = pathinfo($_FILES["fileUpload"]["name"], PATHINFO_EXTENSION);
			$new_images2 = $rename_img.".".$extension;

			$images = $_FILES["fileUpload"]["tmp_name"];
			//$new_images = "Thumbnails_".$_FILES["fileUpload"]["name"];
			//$new_images = $_FILES["fileUpload"]["name"];
			$new_images = $new_images2;

			//ต้นฉบับ
			//copy($_FILES["fileUpload"]["tmp_name"],"imgComfirm/".$_FILES["fileUpload"]["name"]);

			//ย่อขนาดภาพ
			$width=600; //*** Fix Width & Heigh (Autu caculate) ***//
			$size=GetimageSize($images);
			$height=round($width*$size[1]/$size[0]);
			$images_orig = ImageCreateFromJPEG($images);
			$photoX = ImagesX($images_orig);
			$photoY = ImagesY($images_orig);
			$images_fin = ImageCreateTrueColor($width, $height);
			ImageCopyResampled($images_fin, $images_orig, 0, 0, 0, 0, $width+1, $height+1, $photoX, $photoY);
			ImageJPEG($images_fin,"imgComfirm/".$new_images);
			ImageDestroy($images_orig);
			ImageDestroy($images_fin);

           $sqlinsert_main = "INSERT tbconfirmimg (idiw37,cfilename,wkctr,cfname) VALUES ('".$_SESSION['idiw37']."','".$new_images2."','".$_SESSION['wkctr']."','".$record_date."')";
		   mysqli_query($link,$sqlinsert_main);

		   //echo $sqlinsert_main;
	
		 //ย้อนกลับไปที่หน้า Policy นั้นๆ 
		 //echo "Swal.fire('Any fool can use a computer')";
		 //echo "<script>Swal.fire('Success!','You clicked the button!','success')</script>";
		 //echo '<script>Swal.fire("Success!","' . $txt . '","success").then((value)=>{ window.location.href = "index.php?module=' . $myfile . '"; }); </script>';
			//echo"<script language='JavaScript'>";
			//echo"alert('บันทึกข้อมูลเรียบร้อย');";
			//echo"alert('File not over 200 KB\n"+size+" KB');";
			//echo "history.back()";
			//echo"</script>";	

		//echo "บันทึกข้อมูลเรียบร้อย";
		echo "<script>swal('บันทึกข้อมูลเรียบร้อย!', 'You clicked the button!', 'success')</script>";
		//echo "<script>alert('บันทึกข้อมูลเรียบร้อย')</script>";

		//echo '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=index2.php?module=W_confirm_form&op=edit&idplanw='.$_SESSION['idplanw'].'&idiw37='.$_SESSION['idiw37'].'&wkorder='.$_SESSION['wkorder'].' ">';
		 //exit;

		}

}

///จัดการลบข้อมูลใน database และ ลบภาพ
if ($_REQUEST['op'] == "del_img") {
$strSQL_delimg = "DELETE FROM tbconfirmimg WHERE idcimg='".$_REQUEST['idcimg']."'";
$delete="imgComfirm/".$_REQUEST['cfilename']."";
//echo 'delete='.$delete;
@unlink($delete);
	//echo"$delete";
$objQuery_delimg = mysqli_query($link,$strSQL_delimg);
}
if($objQuery_delimg==''){

}else{
	//echo "ลบข้อมูลรูปภาพเรียบร้อย";
    //echo "<script>alert('ลบข้อมูลรูปภาพเรียบร้อย!')</script>";
	echo "<script>swal('ลบข้อมูลรูปภาพเรียบร้อย!', 'You clicked the button!', 'success')</script>";
}
/////////////ส่วนลบไฟล์



//หากมีการกดปุ่มบันทึก
if ($_REQUEST['op'] == "insert_comment") {

	$sqlinsert_main = "INSERT tbconfirmcom (idiw37,comdetail,wkctr,cfname) VALUES ('".$_SESSION['idiw37']."','".$_REQUEST['comdetail']."','".$_SESSION['wkctr']."','".$record_date."')";
	mysqli_query($link,$sqlinsert_main);

	echo "<script>swal('บันทึกข้อมูลเรียบร้อย!', 'You clicked the button!', 'success')</script>";
}

//หากมีการกดปุ่มแก้ไข
if ($_REQUEST['op'] == "edit_comment") {
    $sqlupdate_main = "UPDATE tbconfirmcom SET ";
    $sqlupdate_main .= "  idiw37='".$_REQUEST['idiw37']."', comdetail='".$_REQUEST['comdetail']."', wkctr='".$_SESSION['wkctr']."',cfname='".$record_date."' ";
    $sqlupdate_main .= " WHERE idcom ='".$_REQUEST['idcom']."' ";
    $result = mysqli_query($link, $sqlupdate_main) or die ("Error Query [".$sqlupdate_main."]"); 

	mysqli_query($link,$sqlupdate_main);

	echo "<script>swal('แก้ไขข้อมูลเรียบร้อย!', 'You clicked the button!', 'success')</script>";
}

///จัดการลบข้อมูลใน database
if ($_REQUEST['op'] == "del_comment") {
$strSQL_delimg = "DELETE FROM tbconfirmcom WHERE idcom='".$_REQUEST['idcom']."'";
//echo 'delete='.$delete;
$objQuery_delimg = mysqli_query($link,$strSQL_delimg);
}
if($objQuery_delimg==''){

}else{
	echo "<script>swal('ลบข้อมูลเรียบร้อย!', 'You clicked the button!', 'success')</script>";
}

//=================================
//หากมีการกดปุ่มบันทึกยืนยันการปิดงาน
if ($_REQUEST['op'] == "save_close") {
	$strSQL_chk = " SELECT * FROM tbwrkclose where idiw37 ='".$_SESSION['idiw37']."' AND wkctr='".$_SESSION['wkctr']."'; ";
	$query_chk = mysqli_query($link, $strSQL_chk);
	//$result = mysqli_fetch_array($query_chk);
	$numrow_chk = mysqli_num_rows($query_chk);
	if ($numrow_chk==0){ 
		$sqlinsert_main = "INSERT tbwrkclose (idiw37,cstdate,cendate,wkctr,wktimeclose,wktimewk,wkunit) VALUES ('".$_SESSION['idiw37']."','".$_REQUEST['cstdate']."','".$_REQUEST['cendate']."','".$_SESSION['wkctr']."','".$_REQUEST['wktimeclose']."','".$_REQUEST['wktimewk']."','".$_REQUEST['wkunit']."')";
		mysqli_query($link,$sqlinsert_main);
		echo "<script>swal('ยันยันบันทึกข้อมูลการปิดงานเรียบร้อย!', 'You clicked the button!', 'success')</script>";
	}else{
		echo "<script>swal('Work Order นี้ยืนยันปิดแล้ว!', 'You clicked the button!', 'error')</script>";
	}
}

?>



<style>
	body,html {
		height: 100%;
	}

	/* when not active use specificity to override the !important on border-(color) */
	.nav-tabs .nav-link:not(.active) {
		border-color: transparent !important;
	}
</style>

<script type="text/javascript">
    function chk(){   
        var fty=new Array(".jpg",".jpeg"); // ประเภทไฟล์ที่อนุญาตให้อัพโหลด   
        var a=document.frmMain.fileUpload.value; //กำหนดค่าของไฟล์ใหกับตัวแปร a   
        var permiss=0; // เงื่อนไขไฟล์อนุญาต
        a=a.toLowerCase();    
        if(a !=""){
            for(i=0;i<fty.length;i++){ // วน Loop ตรวจสอบไฟล์ที่อนุญาต   
                if(a.lastIndexOf(fty[i])>=0){  // เงื่อนไขไฟล์ที่อนุญาต   
                    permiss=1;
                    break;
                }else{
                    continue;
                }
            }  
            if(permiss==0){ 
                alert("อัพโหลดได้เฉพาะไฟล์  jpg jpeg");     
                return false;               
            }       
        }        
    }   
</script>

<!-- First, include the Webcam.js JavaScript Library -->
<!-- <script src="//code.jquery.com/jquery-2.1.4.min.js"></script> -->
<script src="assets/js/jquery-2.1.4.min.js"></script>

<div id="app" class="">
<!-- <form role="form" method="POST" action="<?php $PHP_SELF ?>?module=<?php echo $myfile;?>">  -->

	<div class="modal-header">
		<h5 class="modal-title" id="exampleModalLabel">
		<?php if ($_REQUEST['op']=="edit"){
			echo "<i class='far fa-edit nav-icon'></i>&nbsp;<span>แก้ไขข้อมูลการปิดงาน</span>";
		}elseif ($_REQUEST['op']=="del"){
			echo "<i class='fa fa-trash nav-icon'></i>&nbsp;<span>ลบข้อมูลการปิดงาน</span>";
		}else{
			echo "<i class='far fa-id-card nav-icon'></i>&nbsp;<span>เพิ่มข้อมูล/บันทึกการปิดงาน ";
			echo $_REQUEST['wkorder']."</span>";
		}
		?>
		</h5>
		<button type="button" class="close" data-dismiss="modal" aria-label="Close">
			<span aria-hidden="true">&times;</span>
		</button>
	</div>

	<!-- <div class="modal-body"> -->
	<div class="modal-body h-100 py-2"> 

			<ul class="nav nav-tabs border-0" id="myTab" role="tablist">

				<li class="nav-item">
					<a class="nav-link active border border-primary border-bottom-0" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true" aria-selected="true"><strong>Close Images</strong></a>
				</li>
				<li class="nav-item">
					<a class="nav-link border border-warning border-bottom-0" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false" aria-selected="true"><strong>Close Detail</strong></a>
				</li>

				<li class="nav-item">
					<a class="nav-link border border-info border-bottom-0" id="settings-tab" data-toggle="tab" href="#settings" role="tab" aria-controls="settings" aria-selected="false" ><strong>Close Work Confirm</strong></a>
				</li>

			</ul>

			<div class="tab-content h-75">
				<div class="tab-pane h-100 p-3 active border border-primary" id="home" role="tabpanel" aria-labelledby="home-tab">
				<?php
					include("W_confirm_formimg.php");
				?>		
				</div>
				<div class="tab-pane h-100 p-3 border border-warning" id="profile" role="tabpanel" aria-labelledby="profile-tab">
				<?php
					include("W_confirm_formcom.php");
				?>			
				</div>
				<div class="tab-pane h-100 p-3 border border-info" id="settings" role="tabpanel" aria-labelledby="settings-tab">
				<?php
					include("W_confirm_workclose.php");
				?>
				</div>
			</div>


	</div>
	<!-- </div> -->

	<div class="modal-footer">
		<!-- <input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
		<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
		<input type="hidden" name="module" value="<?php echo $myfile; ?>">
		<a href="<?php $PHP_SELF ?>index2.php?module=<?php echo $myfile;?>" onclick="if(confirm('Confrim Cancel.')) return true; else return false;"  role="button" class='btn btn-warning btn-save' ><i class="fa fa-times"></i> ยกเลิก </a>
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
		?> -->
	</div>

<!-- </form> -->
</div>


<!-- normal Modal -->
<div class="modal fade custom-modal" id="ajaxModal" tabindex="-1" role="dialog" aria-labelledby="ajaxModalLabel" aria-hidden="true" data-backdrop="static">
	<div class="modal-dialog" role="document">
		<div class="modal-content">

		</div>
	</div>
</div>
<!-- END normal Modal -->

<!-- large Modal -->
<div class="modal fade custom-modal" id="ajaxLargeModal" tabindex="-1" role="dialog" aria-labelledby="ajaxModalLabel" aria-hidden="true" data-backdrop="static">
	<div class="modal-dialog modal-lg" role="document">
		<div class="modal-content">

		</div>
	</div>
</div>
<!-- END large Modal -->
