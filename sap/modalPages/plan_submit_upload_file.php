<?PHP  
// Include File connect Database
session_start();
require_once('../include/connection.php');
date_default_timezone_set("Asia/Bangkok");


$record_date = mktime(0, 0, 0, date("d"), date("m"), date("Y"));  

// ADD Image
//หากมีการกดปุ่มบันทึก
if ($_REQUEST['op'] == "insert_img") {

	//----- ย่อขนาดภาพ
		if(trim($_FILES["fileUpload"]["tmp_name"]) != "")
		{

			//กำหนดเปลี่ยนแปลงชื่อไฟล์ภาพ
			$random_img = date(Ymd) . time();
			$rename_img = $_REQUEST['idiw37']."_".$_SESSION['wkctr']."_".$random_img;
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
			ImageJPEG($images_fin,"../imgComfirm/".$new_images);
			ImageDestroy($images_orig);
			ImageDestroy($images_fin);

           $sqlinsert_main = "INSERT tbconfirmimg (idiw37,cfilename,wkctr,cfname,cimgcom) VALUES ('".$_REQUEST['idiw37']."','".$new_images2."','".$_SESSION['wkctr']."','".$record_date."', '".$_REQUEST['cimgcom']."' )";
		   mysqli_query($link,$sqlinsert_main);
		   echo "<script>swal('บันทึกข้อมูลเรียบร้อย!', 'You clicked the button!', 'success')</script>";
       	}

	}
	// ADD Image

	
	if(!empty(isset($_REQUEST["Event"]))){
		$Events =  $_REQUEST["Event"]; //รับค่อ Ajax แบบ Post
		$id = $Events[0];
		$op = $Events[1];
		
	
		if ($op == "Del") {
			///จัดการลบข้อมูลใน database
			$strSQL_delimg = "DELETE FROM tbconfirmimg WHERE idcimg='".$id."'";
			//echo 'delete='.$strSQL_delimg;
			$objQuery_delimg = mysqli_query($link,$strSQL_delimg);
		}
		if(!empty($objQuery_delimg)){
			echo "<script>swal('ลบข้อมูลเรียบร้อย! ', 'You clicked the button!', 'success')</script>";
		} // end if($objQuery_delimg=='')
	
	} //end if(!empty(isset($_REQUEST["Event"])))


    include_once("plan_ShowImgUpload.php");
?>