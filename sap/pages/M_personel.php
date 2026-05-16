<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_iw37n.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "ข้อมูลนำเข้า Personel";
$tbl_policy = "tbworkcenter";
$myfile = "M_personel";
$fileload = "Personel.xlsx";

$filed1 = "idwkctr"; // id คีย์หลัก
$filed2 = "titlewkctr";
$filed3 = "namewkctr";
$filed4 = "surnamewkctr";
$filed5 = "titlewkctreng";
$filed6 = "namewkctreng";
$filed7 = "surnamewkctreng";
$filed8 = "startwork";
$filed9 = "iddepartment";
$filed10 = "idposition";
$filed11 = "wkctr";
$filed12 = "plnt";
$filed13 = "cat";
$filed14 = "resp";
$filed15 = "idwkctrgroup";
$filed16 = "idwkctrtype";
$filed17 = "idwklevel";
$filed18 = "wkctrdate";
$filed19 = "wkctrtel";
$filed20 = "wkctrmail";
$filed21 = "labourcost";
$filed22 = "userst";
$filed23 = "pass";
$filed24 = "workstatus";
$filed25 = "imgmember";




//Import Fiel Excel ***********************************************
require_once('./vendor/php-excel-reader/excel_reader2.php');
require_once('./vendor/SpreadsheetReader.php');

if (isset($_POST["import"])){    

    
  $allowedFileType = ['application/vnd.ms-excel','text/xls','text/xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  
  if(in_array($_FILES["file"]["type"],$allowedFileType)){ //เช็คว่าใช่ไฟล์ excel หรือไม่

        $targetPath = './uploads/'.$_FILES['file']['name'];
        move_uploaded_file($_FILES['file']['tmp_name'], $targetPath);
        
        $Reader = new SpreadsheetReader($targetPath);
        
        $sheetCount = count($Reader->sheets());
        
        for($i=0;$i<$sheetCount;$i++){ 
            
            $Reader->ChangeSheet($i);
            $n = 1 ;
            foreach ($Reader as $Row){    
                if($n>2){ // นับแถวที่สองเป็นต้นไป

                //colum ที่ต้องาการเช็คค่าว่าง    
                $Row0 = "";
                if(isset($Row[0])) {          
                   $Row0 = $Row[0];
                }                
                $Row1 = "";
                if(isset($Row[1])) {   
                    $Row1 = $Row[11];
                }
                //colum ที่ต้องาการเช็คค่าว่าง   

                if (!empty($Row0) || !empty($Row1)) { //colum ที่ต้องาการเช็คค่าว่าง   
                    //ADD tb_iw37n

        
        //ค้นหาเลข workorder และ Opac ว่าซ้ำกันหรือไม่
        $SQLtw = "SELECT * FROM $tbl_policy where $filed1 ='".$Row[0]."' ";
        //echo $SQLtw;
        $querytw = mysqli_query($link, $SQLtw) or die ("Error Query [".$SQLtw."]");        
        $num = mysqli_num_rows($querytw);
        //echo $num;

        //แปลงวันที่
       
        if(!empty(trim($Row[7]))){
            $Lineday = explode(".", $Row[7]);      
            $yy = $Lineday[2] - 543;    
            $Row[7] = mktime(0, 0, 0, $Lineday[1], $Lineday[0], $yy);  
        }    
        
        if(!empty(trim($Row[17]))){
            $Lineday = explode(".", $Row[17]);      
            $yy = $Lineday[2] - 543;    
            $Row[17] = mktime(0, 0, 0, $Lineday[1], $Lineday[0], $yy);  
        }
        //แปลงวันที่
        
        //หา ID 
        if(!empty(trim($Row[9]))){                 
            $Row[9] =  ShowDetail('tbposition','position',$Row[9],$filed10); // $tb=Table,  $a=Field Where , $b=Value Search , $c=Field Return1 
        }
        if(!empty(trim($Row[14]))){                 
            $Row[14] =  ShowDetail('tbwkctrgroup','wkctrgroup',$Row[14],$filed15); // $tb=Table,  $a=Field Where , $b=Value Search , $c=Field Return1 
        }
        if(!empty(trim($Row[15]))){                 
            $Row[15] =  ShowDetail('tbwkctrtype','wkctrtype',$Row[15],$filed16); // $tb=Table,  $a=Field Where , $b=Value Search , $c=Field Return1 
        }
        if(!empty(trim($Row[16]))){                 
            $Row[16] =  ShowDetail('tbwklevel','wklevel',$Row[16],$filed17); // $tb=Table,  $a=Field Where , $b=Value Search , $c=Field Return1 
        }

        

        //ค้นหาเลข workorder
        if($num == 0){ //Check workorder ซ้ำ
            $strSQL = "";
            $strSQL = "INSERT $tbl_policy ($filed1,$filed2,$filed3,$filed4,$filed5,$filed6,$filed7,$filed8,$filed9,$filed10,$filed11,$filed12,$filed13,$filed14,$filed15,$filed16,$filed17,$filed18,$filed19,$filed20,$filed21,$filed22,$filed23,$filed24) ";
            $strSQL .= " VALUES (\"$Row[0]\", \"$Row[1]\", \"$Row[2]\", \"$Row[3]\" , \"$Row[4]\" , \"$Row[5]\" , \"$Row[6]\" , \"$Row[7]\" , \"$Row[8]\" , \"$Row[9]\" , \"$Row[10]\" , \"$Row[11]\" , \"$Row[12]\" , \"$Row[13]\" , \"$Row[14]\" , \"$Row[15]\" , \"$Row[16]\" , \"$Row[17]\" , \"$Row[18]\" , \"$Row[19]\" , \"$Row[20]\" , \"$Row[21]\" , \"$Row[22]\" , \"1\" )";            
            $result = mysqli_query($link, $strSQL) or die ("Error Query [".$strSQL."]");            
            //echo "ADD..". $Row[1] ." / $strSQL <br> "; 
        }else{
           // echo "tb_iw37n ซ้ำ ". $strSQL  ."<br>" ;
           //Update  ตารางหลัก
          $sqlupdate_main = "UPDATE $tbl_policy SET ";
          $sqlupdate_main .= "$filed2= \"$Row[1]\", $filed3= \"$Row[2]\" , $filed4= \"$Row[3]\" , $filed5= \"$Row[4]\" , $filed6= \"$Row[5]\" , $filed7= \"$Row[6]\" , $filed8= \"$Row[7]\" , $filed9= \"$Row[8]\" , $filed10= \"$Row[9]\" , $filed11= \"$Row[10]\" , $filed12= \"$Row[11]\" , $filed13= \"$Row[12]\" , $filed14= \"$Row[13]\" , $filed15= \"$Row[14]\" , $filed16= \"$Row[15]\" , $filed17= \"$Row[16]\" , $filed18= \"$Row[17]\" , $filed19= \"$Row[18]\" , $filed20= \"$Row[19]\" , $filed21= \"$Row[20]\" , $filed22= \"$Row[21]\" , $filed23= \"$Row[22]\" ";
          $sqlupdate_main .= " where $filed1 ='".$Row[0]."' ";
          $result = mysqli_query($link, $sqlupdate_main) or die ("Error Query [".$sqlupdate_main."]"); 
          //echo "Update..". $Row[1] ."/  $SQLtw <br> "; 
        } //Check workorder ซ้ำ
        //ADD tb_iw37n                 
                                     
      
                } // end if (!empty($name) || !empty($description))
                } // end นับแถวที่สองเป็นต้นไป
                $n++;
             } //end foreach ($Reader as $Row)    
         } //end for($i=0;$i<$sheetCount;$i++)

         //*********  เช็คสถานะการบันทึก *********************/
         if (!empty($result)) {
            $type = "success";
            $message = "Excel Data Imported into the Database";
            echo "<script> alert('$type : $message'); </script>";
        } else {
            $type = "error";
            $message = "Problem in Importing Excel Data";
            echo "<script> alert('$type : $message'); </script>";
        } //end if (! empty($result))   
        //*********  เช็คสถานะการบันทึก *********************/
  } else { 
        $type = "error";
        $message = "Invalid File Type. Upload Excel File.";
        echo "<script> alert('$type : $message'); </script>";
  } //end if(in_array($_FILES["file"]["type"],$allowedFileType)) //เช็คว่าใช่ไฟล์ excel หรือไม่
} // end if (isset($_POST["import"]))
//Import File Excel ***********************************************


//หากมีการกดปุ่มบันทึก
if ($_REQUEST['op'] == "save") {
     //ตรวจสอบการกรอกข้อมูลว่ามีการดำเนินการกรอกข้อมูลแล้วหรือยัง
     $sql = "SELECT * FROM $tbl_policy WHERE $filed1 = '" . $_REQUEST["id"] . "' ";
     $result_chk = $link->query($sql) or die ("Error Query [".$sql."]") ;
     //echo $sql;  

    //แปลงวันที่
    if(!empty(trim($_REQUEST[$filed8]))){
        $Lineday = explode(".", $_REQUEST[$filed8]);                
        $Row[8] = mktime(0, 0, 0, $Lineday[1], $Lineday[0], $Lineday[2]);  
    }     
    if(!empty(trim($_REQUEST[$filed18]))){
        $Lineday = explode(".", $_REQUEST[$filed18]);      
        $Row[18] = mktime(0, 0, 0, $Lineday[1], $Lineday[0], $Lineday[2]);  
    }       
    //แปลงวันที่

         // ADD Image

	//----- ย่อขนาดภาพ
		if(trim($_FILES["fileUpload"]["tmp_name"]) != "")
		{

			//กำหนดเปลี่ยนแปลงชื่อไฟล์ภาพ
			$random_img = date(Ymd) . time();
			$rename_img = $_REQUEST[$filed1]."_".$_REQUEST[$filed11]."_".$random_img;
			//echo $rename_img;

			//หานามสกุลไฟล์
			$extension = pathinfo($_FILES["fileUpload"]["name"], PATHINFO_EXTENSION);
			$new_images2 = $rename_img.".".$extension;

			$images = $_FILES["fileUpload"]["tmp_name"];	
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
			ImageJPEG($images_fin,"./imgMember/".$new_images);
			ImageDestroy($images_orig);
			ImageDestroy($images_fin);

       	}else{
            $new_images2 = "";
        }
	// ADD Image
    


     // หากมีการกรอกข้อมูลแล้วให้ดำเนินการ Update
     if ($result_chk->num_rows > 0) {
          //Update  ตารางหลัก
          $sqlupdate_main = "UPDATE $tbl_policy SET ";
          $sqlupdate_main .= " $filed1= \"$_REQUEST[$filed1]\", $filed2= \"$_REQUEST[$filed2]\", $filed3= \"$_REQUEST[$filed3]\", $filed4= \"$_REQUEST[$filed4]\", $filed5= \"$_REQUEST[$filed5]\", $filed6= \"$_REQUEST[$filed6]\", $filed7= \"$_REQUEST[$filed7]\", $filed8= \"$Row[8]\", $filed9= \"$_REQUEST[$filed9]\", $filed10= \"$_REQUEST[$filed10]\", $filed11= \"$_REQUEST[$filed11]\", $filed12= \"$_REQUEST[$filed12]\", $filed13= \"$_REQUEST[$filed13]\", $filed14= \"$_REQUEST[$filed14]\", $filed15= \"$_REQUEST[$filed15]\", $filed16= \"$_REQUEST[$filed16]\", $filed17= \"$_REQUEST[$filed17]\", $filed18= \"$Row[18]\", $filed19= \"$_REQUEST[$filed19]\", $filed20= \"$_REQUEST[$filed20]\", $filed21= \"$_REQUEST[$filed21]\", $filed22= \"$_REQUEST[$filed22]\", $filed23= \"$_REQUEST[$filed23]\" , $filed24= \"$_REQUEST[$filed24]\" ,$filed25= \"$new_images2\"  ";
          $sqlupdate_main .= " WHERE $filed1 = '" . $_REQUEST["id"] . "' ";
          $result = $link->query($sqlupdate_main) or die ("Error Query [".$sqlupdate_main."]") ;
          //echo $sqlupdate_main;
         
         //*********  เช็คสถานะการบันทึก *********************/
         if (!empty($result)) {
            $type = "success";
            $message = "Edit Personel ";
           // echo "<script> alert('$type : $message'); </script>";
        } else {
            $type = "error";
            $message = "Problem in Edit Personel";
            echo "<script> alert('$type : $message'); </script>";
        } //end if (! empty($result))   
     } else {
          $record_date = date("Y-m-d H:i:s");
          //ดำเนินการเพิ่มข้อมูลลงในตารางหลัก
          $strSQL = "INSERT $tbl_policy ($filed1,$filed2,$filed3,$filed4,$filed5,$filed6,$filed7,$filed8,$filed9,$filed10,$filed11,$filed12,$filed13,$filed14,$filed15,$filed16,$filed17,$filed18,$filed19,$filed20,$filed21,$filed22,$filed23,$filed24,$filed25) ";
          $strSQL .= " VALUES (\"$_REQUEST[$filed1]\", \"$_REQUEST[$filed2]\", \"$_REQUEST[$filed3]\", \"$_REQUEST[$filed4]\", \"$_REQUEST[$filed5]\", \"$_REQUEST[$filed6]\", \"$_REQUEST[$filed7]\", \"$Row[8]\", \"$_REQUEST[$filed9]\", \"$_REQUEST[$filed10]\", \"$_REQUEST[$filed11]\", \"$_REQUEST[$filed12]\", \"$_REQUEST[$filed13]\", \"$_REQUEST[$filed14]\", \"$_REQUEST[$filed15]\", \"$_REQUEST[$filed16]\", \"$_REQUEST[$filed17]\", \"$Row[18]\", \"$_REQUEST[$filed19]\", \"$_REQUEST[$filed20]\", \"$_REQUEST[$filed21]\", \"$_REQUEST[$filed22]\", \"$_REQUEST[$filed23]\", \"1\", \"$new_images2\" )";            
          $result = $link->query($strSQL) or die ("Error Query [".$strSQL."]") ;
          //echo $sqlupdate_main;
          //*********  เช็คสถานะการบันทึก *********************/
         if (!empty($result)) {
            $type = "success";
            $message = "Add Personel ";
           // echo "<script> alert('$type : $message'); </script>";
        } else {
            $type = "error";
            $message = "Problem in Add Personel";
            echo "<script> alert('$type : $message'); </script>";
        } //end if (! empty($result))   
     }



     //ย้อนกลับไปที่หน้า Policy นั้นๆ 
	 //echo "Swal.fire('Any fool can use a computer')";
     echo "<script>Swal.fire('Success!','You clicked the button!','success')</script>";
     //echo '<script>Swal.fire("Success!","' . $txt . '","success").then((value)=>{ window.location.href = "index.php?module=' . $myfile . '"; }); </script>';
     echo '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=index2.php?module='.$myfile.'">';
     exit;
}

//หากมีการกดปุ่มลบ

if ($_REQUEST['op'] == "del" && !empty(trim( $_REQUEST["id"] )) ) {
	 $sql_del = "DELETE FROM $tbl_policy WHERE $filed1 = '" . $_REQUEST["id"] . "' ";
     $result = $link->query($sql_del) or die ("Error Query [".$strSQL."]") ;
    if($result >0){
        echo "<script> alert('Delete Success!'); </script>";
        echo '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=index2.php?module='.$myfile.'">';
        exit;
    }     
	 //echo "ลบข้อมูลเรียบร้อย";
    
}

?>

                    <div class="container-fluid">
                        <h1 class="mt-4"><?php echo $title_page?></h1>
                        <ol class="breadcrumb mb-4">
                            <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                            <li class="breadcrumb-item active"><?php echo $title_page?></li>
                        </ol>
                        <div class="card mb-4">
                            <div class="card-body">ตารางรายการ <?php echo $title_page?></div>
                        </div>
                        <div class="card mb-4">
                            <div class="card-header">
							<i class="fas fa-table mr-1"></i><?php echo $_REQUEST['module']?>
								<div class="float-right">
								<a href="./download/<?PHP echo $fileload; ?>" role="button" class="btn btn-info btn-create float-right" ><i class="fa fa-download nav-icon"></i>&nbsp;ดาวน์โหลด</a>
<a href="#" role="button" class="btn btn-warning btn-create float-right" data-toggle="modal" data-target=".preview"><i class="far fa-id-card nav-icon"></i>&nbsp;ส่งออกไฟล์ข้อมูล</a>
<a href="pages/<?php echo $myfile;?>_imports.php" role="button" class="btn btn-success btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-upload nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูล</a>
                                <a href="<?php $PHP_SELF ?>index2.php?module=<?php echo $myfile;?>_form" role="button" class="btn btn-dark btn-create float-right" data-target="#ajaxLargeModal"><i class="far fa-id-card nav-icon"></i>&nbsp;สร้างใหม่</a>
								</div>
							</div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='50'>
                                        <thead class="thead-dark">
                                            <tr>
                                                <th>รหัสพนักงาน</th>
                                                <th>ชื่อ-สกุล</th>
                                                <th>ตำแหน่ง</th>
                                                <th>หน่วยงาน</th>
                                                <th>สถานะ</th>
                                                <th>action</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th>รหัสพนักงาน</th>
                                                <th>ชื่อ-สกุล</th>
                                                <th>ตำแหน่ง</th>
                                                <th>หน่วยงาน</th>
                                                <th>สถานะ</th>  
                                                <th>action</th>
                                            </tr>
                                        </tfoot>
                                        <tbody>
<?php
$strSQL = "SELECT * FROM $tbl_policy;";
$query = mysqli_query($link, $strSQL) or die ("Error Query [".$strSQL."]") ;
//echo $strSQL;
while($result = mysqli_fetch_array($query))
{
?>
                                            <tr>
                                                <td><?php echo $result[$filed1];?>   </td> 
                                                <td><?php echo $result[$filed2].$result[$filed3] ." ". $result[$filed4]   ;?></td>                                               
                                                <td><?php echo ShowDetail('tbposition',$filed10,$result[$filed10],'position') ;?></td> 
                                                <td><?php echo ShowDetail('tbdepartment',$filed9,$result[$filed9],'department');?></td> 
                                                <td><?php echo ShowDetail('tbuserst',$filed22,$result[$filed22],'userstdesc');?></td>                                          
                                                <td align="center">
                                                <a href="<?php $PHP_SELF ?>index2.php?module=<?php echo $myfile;?>_form&op=edit&id=<?php echo $result[$filed1];?>" data-id="<?php echo $result[$filed1]; ?>" data-name="<?php echo $result[$filed2]; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit" ><i class="fa fa-edit"></i> แก้ไข</a>
                                                <a href="<?php $PHP_SELF ?>index2.php?module=<?php echo $myfile;?>&op=del&id=<?php echo $result[$filed1];?>" onclick="if(confirm('Confrim Delete.')) return true; else return false;"  role="button" class="btn btn-outline-dark btn-sm btn-edit" ><i class="fa fa-trash"></i> ลบ</a>

												</td>
                                            </tr>
<?php } ?>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
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

