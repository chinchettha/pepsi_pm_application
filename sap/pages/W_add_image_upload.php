<?php
session_start();
//if ($op == "insert_img") {

//แปลงวันที่ปัจจุบัน
//echo date("d.m.Y", mktime(0, 0, 0, date("d"), date("m"), date("Y")));
//echo '<br>'.date("d.m.Y H:i:s");
$record_date = date("d.m.Y", mktime(0, 0, 0, date("d"), date("m"), date("Y")));  
$record_date2 = date("d.m.Y H:i:s");

include('../include/connection.php');
//-------------------- Insert Picture
if ($_REQUEST['op'] == "insert_img") {
	define("MAX_SIZE" , 5120000);//กำหนดขนาดภาพสูงสุด 5 Mb

	//กำหนดเปลี่ยนแปลงชื่อไฟล์ภาพ
	$random_img = date(Ymd) . time();
	$rename_img = $_SESSION['idiw37']."_".$_SESSION['wkctr']."_".$random_img;

	if ($_FILES["txt_image"]["name"] != "") {

		if ($_FILES["txt_image"]["type"] == "image/jpeg") {
				$rename_image = "$rename_img.jpg";
			//} elseif ($_FILES["txt_image"]["type"] == "image/jpg") {
			//	$rename_image = "$rename_img.jpg";
			} elseif ($_FILES["txt_image"]["type"] == "image/png") {
				$rename_image = "$rename_img.png";
			} elseif ($_FILES["txt_image"]["type"] == "image/gif") {
				$rename_image = "$rename_img.gif";
			} else {
			echo"<script language='JavaScript'>";
			echo"alert('รูปแบบไฟล์ไม่ถูกต้อง');";
			//echo"alert('File not over 200 KB\n"+size+" KB');";
			echo "history.back()";
			echo"</script>";	
			exit();
		}

		   if($_FILES['txt_image']['size']>0) //เมื่อมีการอัพโหลดภาพเกิดขึ้น
			  {         
				 if($_FILES['txt_image']['size']>MAX_SIZE) //ตรวจสอบขนาด
				 {
					echo "ขนาดรูปใหญ่เกินกว่า 5 Mb.<br><br>";
					echo"<script language='JavaScript'>";
					echo"alert('ขนาดรูปใหญ่เกินกว่า 5 Mb.');";
					//echo"alert('File not over 200 KB\n"+size+" KB');";
					echo "history.back()";
					echo"</script>";	
					exit();
				 }
			  }

		//---- เพิ่มข้อมูลรูปภาพลงโฟลเดอร์เก็บข้อมูลภาพ
		copy($_FILES["txt_image"]["tmp_name"], "imgComfirm/" . $rename_image);

		/*
		//---- ตรวจข้อมูลลงตารางเก็บข้อมูลภาพ ว่ามีหรือยัง
		$strSQL = " SELECT * FROM tb_workorder_image where mntplan ='".$_SESSION['mntplan']."' AND workorder='".$_SESSION['workorder']."';";
		$query = mysqli_query($link, $strSQL);
		//$result = mysqli_fetch_array($query);
		$numrow = mysqli_num_rows($query);
		if ($numrow==0)
			{
			//---- เพิ่มข้อมูลลงตารางเก็บข้อมูลภาพ ถ้ามีให้เพิ่ม ถ้าไม่มีให้ปรับปรุง
			$sql = "INSERT INTO tb_workorder_image(mntplan, workorder,wrk_image) VALUES('".$_SESSION['mntplan']."','".$_SESSION['workorder']."','".$rename_image."')";
			mysqli_query($link, $sql);
		}else{
			  $sqlupdate = "UPDATE tb_workorder_image SET ";
			  $sqlupdate .= " mntplan='" . $_SESSION['mntplan'] . "',workorder='" . $_SESSION['workorder'] . "',wrk_image='" . $rename_image . "' ";
			  $sqlupdate .= " WHERE mntplan ='".$_SESSION['mntplan']."' AND workorder='".$_SESSION['workorder']."' ";
				mysqli_query($link, $sql);
		}
		*/

		//---- เพิ่มข้อมูลลงตารางเก็บข้อมูลภาพ
		$sql = "INSERT INTO tbconfirmimg(idiw37,cfilename,wkctr,cfname) VALUES('".$_SESSION['idiw37']."','".$rename_image."','".$_SESSION['wkctr']."','".$record_date2."')";
		mysqli_query($link, $sql);

		//echo $sql;


		echo"<script language='JavaScript'>";
		echo"alert('Data Inserted Successfully');";
		//echo"alert('File not over 200 KB\n"+size+" KB');";
		echo "history.back()";
		echo"</script>";	
		exit();
		//break;


	}
}

?>


<?php

/*
define("MAX_SIZE" , 512000);//กำหนดขนาดภาพสูงสุด 5 Mb
   if($_FILES['mImg']['size']>0) //เมื่อมีการอัพโหลดภาพเกิดขึ้น
      {         
         if($_FILES['mImg']['size']>MAX_SIZE) //ตรวจสอบขนาด
         {
         echo "ขนาดรูปใหญ่เกินกว่า 70 กิโลไบต์<br><br>";
         }
         else
			 $mImg_name=$_FILES['mImg']['name'];
			 $array_last=explode(".",$mImg_name);
				$c=count($array_last)-1; 
				$lastname=strtolower($array_last[$c]) ;
	
	if ($lastname=="gif" or $lastname=="jpg" or $lastname=="jpeg" or $lastname=="png") 
         {
       //ตรวจสอบนามสกุล
         }else{
		   echo "รูปต้องเป็นชนิด gif หรือ jpg หรือ png เท่านั้น <br><br>";   
		 }
	  }
*/
//-------------------- Insert File
/*
            if ($_FILES["txt_file"]["name"] != "") {
                if ($_FILES["txt_file"]["type"] == "application/msword") {
                    $rename_file = "$time.doc";
					} elseif ($_FILES["txt_file"]["type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                    $rename_file = "$time.docx";
					} elseif ($_FILES["txt_file"]["type"] == "application/vnd.ms-excel") {
                    $rename_file = "$time.xls";
					} elseif ($_FILES["txt_file"]["type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    $rename_file = "$time.xlsx";
					} elseif ($_FILES["txt_file"]["type"] == "application/vnd.ms-powerpoint") {
                    $rename_file = "$time.ppt";
					} elseif ($_FILES["txt_file"]["type"] == "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
                    $rename_file = "$time.pptx";
					} elseif ($_FILES["txt_file"]["type"] == "application/pdf") {
                    $rename_file = "$time.pdf";
					} elseif ($_FILES["txt_file"]["type"] == "application/x-rar-compressed, application/octet-stream") {
                    $rename_file = "$time.rar";
					} elseif ($_FILES["txt_file"]["type"] == "application/zip, application/octet-stream, application/x-zip-compressed, multipart/x-zip") {
                    $rename_file = "$time.zip";
					} else {
                    echo "file ไม่ถูกต้อง";
                }
                copy($_FILES["txt_file"]["tmp_name"], "document/" . $rename_file);
            }
*/
/*
            if ($_FILES["txt_image"]["name"] != "") {
                $thumbnail = $rename_image;
				} else {
                $thumbnail = $_POST['old_img'];
            }

            if ($_FILES["txt_file"]["name"] != "") {
                $file = $rename_file;
				} else {
                $file = "";
            }
*/


		//$strSQL = "INSERT INTO tbl_news (new_title, new_category, new_short, new_status, new_content, new_thumbnail, new_file, new_date, mem_id) VALUES ('$txt_title', '$txt_category', '$txt_short', '$txt_status', '$txt_content', '$thumbnail', '$file', '$txt_date', '$txt_mem_id')";
		//$move_page = "news&id_category=$txt_category"; //link กลับไปหาเก่า


//break;
?>
