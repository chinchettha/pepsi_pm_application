
<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_iw37n.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "ข้อมูลนำเข้า Confirm";
$tbl_policy = "tbcofirm";
$myfile = "M_Confirm";
$fileload = "Confirm.xlsx";
$lim = "15000"; // จำนวนข้อมูลที่แสดง

$filed1 = "idclose"; // id คีย์หลัก
$filed2 = "idiw37";
$filed3 = "confirmation";
$filed4 = "wkctr";
$filed5 = "stdate";
$filed6 = "endate";
$filed7 = "cwkctr";
$filed8 = "timeclose";
$filed9 = "timewk";
$filed10 = "unitc";
$filed11 = "wkorder";



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
        ?>
        <!------ // แสดงผลการ  Update ******************  -->
         <div class="alert alert-warning alert-dismissible"> 
         <strong class="text-center"> ประมวลผลการนำเข้าข้อมูล........  </strong>
          <button type="button" class="close" data-dismiss="alert">&times;</button> 
          <table class="table table-bordered table-hover datatable-desc" id="dataTable2" width="100%" cellspacing="0" data-page-length='50'>
             <thead class="thead-dark">
                 <tr class="text-center">
                     <th>Row</th> 
                     <th>Status</th> 
                     <th>Confirm</th>
                     <th>Order</th>                                                                                              
                     <th>WkCtrAct</th>
                     <th>Act.start</th>
                     <th>Act.finish</th>            
                 </tr>
             </thead>
         <!------ // แสดงผลการ  Update ******************  -->
 
         <?PHP  
        
        for($i=0;$i<$sheetCount;$i++){       
            $Reader->ChangeSheet($i);
            $n = 1 ;
            foreach ($Reader as $Row){    
                if($n>2){ // นับแถวที่สองเป็นต้นไป

        // แสดงผลการ  Update ******************  -->    
        if (trim($Row[0]) == "" || trim($Row[3]) == "" || trim($Row[6]) == "" || trim($Row[7]) == "" || trim($Row[8]) == "" || trim($Row[10]) == "" || trim($Row[11]) == "" || trim($Row[14]) == "" || trim($Row[15]) == "" || trim($Row[16]) == "" || trim($Row[17]) == ""  ) { //colum ที่ต้องาการเช็คค่าว่าง   
            ?>
            <tr>
                <td class="text-center" ><?PHP echo $n ?></td>
                <td><strong> ผิดพลาด</strong>  FALSE...</td>
                <td><?PHP echo $Row[0] ?></td>
                <td><?PHP echo $Row[3] ?></td>
                <td><?PHP echo $Row[6] ?></td>
                <td ><?PHP echo $Row[7] ?></td>
                <td ><?PHP echo $Row[8] ?></td>
            </tr>
        <?PHP    
        } else { // if ( $Row[0]== "" || $Row[1]=="" ) { //colum ที่ต้องาการเช็คค่าว่าง   
        // แสดงผลการ  Update ******************  -->

                    //ADD tb_iw37n
             
        //แปลงวันที่
        if(!empty(trim($Row[11]))){
            $day11 = explode(".", $Row[11]);          
            $Row[11] = mktime(0, 0, 0, $day11[1], $day11[0], $day11[2]);  
        } 
        if(!empty(trim($Row[16]))){
            $time14 = explode(":", $Row[14]);  //หาเวลา           
            $day16 = explode(".", $Row[16]);    // หาวันที่      
            $Row[16] = mktime($time14[0], $time14[1], $time14[2], $day16[1], $day16[0], $day16[2]);  
        } 
        if(!empty(trim($Row[17]))){
            $time15 = explode(":", $Row[15]);  //หาเวลา           
            $day17 = explode(".", $Row[17]);    // หาวันที่      
            $Row[17] = mktime($time15[0], $time15[1], $time15[2], $day17[1], $day17[0], $day17[2]);  
        } 
        //แปลงวันที่

        //แปลงหน่วยเวลาทำงานเป็น นาที
        if($Row[8] == "H"){
            $Row[7] = $Row[7] * 60;
        }
        //แปลงหน่วยเวลาทำงานเป็น นาที

        //หา idiw37 
        $SQLiw37 = "SELECT * FROM tbiw37n where wkorder ='".$Row[3]."' LIMIT 1  ";
        $qriw37 = mysqli_query($link, $SQLiw37) or die ("Error Query [".$SQLiw37."]");        
        $numIw37 = mysqli_num_rows($qriw37);
        if($numIw37 >0){
            $rowIw37 = mysqli_fetch_array($qriw37);
            $idiw37 = $rowIw37["idiw37"];
        }else{
            $idiw37 = "";
        }
        //หา idiw37 


        //ค้นหาเลข workorder และ Opac ว่าซ้ำกันหรือไม่
        $SQLtw = "SELECT * FROM $tbl_policy where $filed3 ='".$Row[0]."' and $filed11 ='".$Row[3]."'  and $filed8 = '".$Row[11]."' and $filed4 = '".$Row[6]."'  ";
        //echo $SQLtw;
        $querytw = mysqli_query($link, $SQLtw) or die ("Error Query [".$SQLtw."]");        
        $num = mysqli_num_rows($querytw);
        //echo $num;
        //ค้นหาเลข workorder
        if($num == 0){ //Check workorder ซ้ำ
            $strSQL = "";
            $strSQL = "INSERT $tbl_policy ($filed2,$filed3,$filed4,$filed5,$filed6,$filed7,$filed8,$filed9,$filed10,$filed11) ";
            $strSQL .= " VALUES ( '".$idiw37."', '".$Row[0]."', '".$Row[6]."', '".$Row[16]."' , '".$Row[17]."' , '".$Row[19]."' , '".$Row[11]."' , '".$Row[7]."' , 'Min' , '".$Row[3]."'  )";            
            $result = mysqli_query($link, $strSQL) or die ("Error Query [".$strSQL."]");            
           // XXXXXXXXXX แสดงผลการ  Update ****************** 
           $IMport = "New ";
           if(!empty($result)){
               $IMport .= " Success...";
           }else {
               $IMport .= " False...";
           }              
           // XXXXXXXXXX แสดงผลการ  Update ****************** 
        }else{
            $result0 = mysqli_fetch_array($querytw);
           // echo "tb_iw37n ซ้ำ ". $strSQL  ."<br>" ;
           //Update  ตารางหลัก
          $sqlupdate_main = "UPDATE $tbl_policy SET ";
          $sqlupdate_main .= "  $filed2= '".$idiw37."', $filed4= '".$Row[6]."',$filed5=  '".$Row[16]."',$filed6=  '".$Row[17]."',$filed7=  '".$Row[19]."',$filed8=  '".$Row[11]."',$filed9=  '".$Row[7]."'  ";
          $sqlupdate_main .= " where $filed1 ='".$result0["idclose"]."'  ";
          $result = mysqli_query($link, $sqlupdate_main) or die ("Error Query [".$sqlupdate_main."]"); 
          // XXXXXXXXXX แสดงผลการ  Update ******************
          $IMport = "Update ";
          if(!empty($result)){
            $IMport .= " Success...";
          }else {
            $IMport .= " False...";
          }       
          // XXXXXXXXXX แสดงผลการ  Update ******************  
        } //Check workorder ซ้ำ
        //ADD tb_iw37n                 
             // XXXXXXXXXX แสดงผลการ  Update ******************
        ?>
        <tr>
            <td class="text-center" ><?PHP echo $n ?></td>
            <td><?PHP echo $IMport ?></td>
            <td><?PHP echo $Row[0] ?></td>
            <td class="text-center" ><?PHP echo $Row[3] ?></td>
            <td class="text-center" ><?PHP echo $Row[6] ?></td>
            <td class="text-center" ><?PHP echo date("d.m.Y H:i:s", $Row[16] ) ; ?></td>
            <td class="text-center" ><?PHP echo date("d.m.Y H:i:s", $Row[17] ) ;  ?></td>
        </tr>
    <?PHP  
    //XXXXXXXXXX แสดงผลการ  Update    **************                        
      
                } // end if (!empty($name) || !empty($description))
                } // end นับแถวที่สองเป็นต้นไป
                $n++;
             } //end foreach ($Reader as $Row)    
         } //end for($i=0;$i<$sheetCount;$i++)

         //XXXXXXXXXX แสดงผลการ  Update ******************
         echo "</table> </div>";   
        //XXXXXXXXXX แสดงผลการ  Update ******************

         //*********  เช็คสถานะการบันทึก *********************/
         //echo "Result=". $result;
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
  //ย้อนกลับไปที่หน้า Policy นั้นๆ 
} // end if (isset($_POST["import"]))
//Import File Excel ***********************************************


//หากมีการกดปุ่มบันทึก
if ($_REQUEST['op'] == "save") {
     //ตรวจสอบการกรอกข้อมูลว่ามีการดำเนินการกรอกข้อมูลแล้วหรือยัง
     $sql = "SELECT * FROM $tbl_policy WHERE $filed1 = '" . $_REQUEST[$filed1] . "' ";
     $result_chk = $link->query($sql);
     //echo $sql;
     
      //แปลงวันที่
      if(!empty(trim($_REQUEST[$filed4]))){
        $post4 = explode(".", $_REQUEST[$filed4]);          
        $post4 = mktime(0, 0, 0, $post4[1], $post4[0], $post4[2]);  
      }    
      if(!empty(trim($_REQUEST[$filed6]))){
        $post6 = explode(".", $_REQUEST[$filed6]);          
        $post6 = mktime(0, 0, 0, $post6[1], $post6[0], $post6[2]);  
      } 
      if(!empty(trim($_REQUEST[$filed7]))){
        $post7 = explode(".", $_REQUEST[$filed7]);          
        $post7 = mktime(0, 0, 0, $post7[1], $post7[0], $post7[2]);  
      }    
    //แปลงวันที่

     // หากมีการกรอกข้อมูลแล้วให้ดำเนินการ Update
     if ($result_chk->num_rows > 0) {
          //Update  ตารางหลัก
          $sqlupdate_main = "UPDATE $tbl_policy SET ";
          $sqlupdate_main .= " $filed2= '".$_REQUEST[$filed2]."',  $filed3= '".$_REQUEST[$filed3]."', $filed4= '".$post4."',$filed5=  '".$_REQUEST[$filed5]."',$filed6=  '".$post6."',$filed7=  '".$post7."',$filed8=  '".$_REQUEST[$filed8]."',$filed9='".$_REQUEST[$filed9]."',$filed10='".$_REQUEST[$filed10]."',$filed11='".$_REQUEST[$filed11]."',$filed12='".$_REQUEST[$filed12]."',$filed13='".$_REQUEST[$filed13]."',$filed14='".$_REQUEST[$filed14]."',$filed15='".$_REQUEST[$filed15]."',$filed16='".$_REQUEST[$filed16]."',$filed17='".$_REQUEST[$filed17]."' ";
          $sqlupdate_main .= " WHERE $filed1 = '" . $_REQUEST[$filed1] . "' ";
          $result = $link->query($sqlupdate_main);
		 // echo $sqlupdate_main;
     } else {
          $record_date = date("Y-m-d H:i:s");
          //ดำเนินการเพิ่มข้อมูลลงในตารางหลัก
          $strSQL = "INSERT $tbl_policy ($filed2,$filed3,$filed4,$filed5,$filed6,$filed7,$filed8,$filed9,$filed10,$filed11,$filed12,$filed13,$filed14,$filed15,$filed16,$filed17) ";
            $strSQL .= " VALUES ('$_REQUEST[$filed2]', '$_REQUEST[$filed3]', '$post4', '$_REQUEST[$filed5]', '$post6', '$post7', '$_REQUEST[$filed8]', '$_REQUEST[$filed9]', '$_REQUEST[$filed10]', '$_REQUEST[$filed11]', '$_REQUEST[$filed12]', '$_REQUEST[$filed13]', '$_REQUEST[$filed14]', '$_REQUEST[$filed15]', '$_REQUEST[$filed16]', '$_REQUEST[$filed17]' )";            
          $result = $link->query($strSQL);
		  //echo $sqlupdate_main;
     }

     //ย้อนกลับไปที่หน้า Policy นั้นๆ 
     echo  "<script> alert('Success!:You clicked the button!'); </script>";   
     echo '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=index2.php?module='.$myfile.'">';
     exit;
}

//หากมีการกดปุ่มลบ
if ($_REQUEST['op'] == "del") {
	 $sql_del = "DELETE FROM $tbl_policy WHERE $filed1 = '" . $_REQUEST[$filed1] . "' ";
     $link->query($sql_del);
     echo  "<script> alert('Success!:You clicked the button!'); </script>";   
     echo '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=index2.php?module='.$myfile.'">';
     exit;
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
<!--<a href="#" role="button" class="btn btn-warning btn-create float-right" data-toggle="modal" data-target=".preview"><i class="far fa-id-card nav-icon"></i>&nbsp;ส่งออกไฟล์ข้อมูล</a> -->
<a href="pages/<?php echo $myfile;?>_imports.php" role="button" class="btn btn-success btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-upload nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูล</a>
<!--<a href="pages/<?php echo $myfile;?>_form.php" role="button" class="btn btn-dark btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="far fa-id-card nav-icon"></i>&nbsp;สร้างใหม่</a> -->
								</div>
							</div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='50'>
                                        <thead class="thead-dark">
                                            <tr>
                                            <th>Confirm</th>
                                            <th>Order</th>                                                                                              
                                            <th>WkCtrAct</th>
                                            <th>Act.start</th>
                                            <th>Act.finish</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                            <th>Confirm</th>
                                            <th>Order</th>                                                                                              
                                            <th>WkCtrAct</th>
                                            <th>Act.start</th>
                                            <th>Act.finish</th>  
                                           
                                            </tr>
                                        </tfoot>
                                        <tbody>
<?php
$strSQL = "SELECT * FROM $tbl_policy order by endate  DESC  limit 0,$lim ";
//echo $strSQL;
$query = mysqli_query($link, $strSQL);
//echo $strSQL;
while($result = mysqli_fetch_array($query))
{
?>
                                            <tr>
                                                <td><?php echo $result[$filed3];?></td>
                                                <td><?php echo $result[$filed11];?></td>                                               
                                                <td><?php echo $result[$filed4];?></td>
                                                <td><?php if(!empty(trim($result[$filed5]))){ echo date("d.m.Y H:i:s", $result[$filed5]) ;} ?></td>
                                                <td><?php if(!empty(trim($result[$filed6]))){ echo date("d.m.Y H:i:s", $result[$filed6]) ;} ?></td>
                                                
                                            </tr>
<?php } ?>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

	<div class="modal fade preview" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel">
		<div class="modal-dialog modal-sm">
			<div class="modal-content">
				<div class="modal-body">
					<b>การเตรียม file</b><br>
					1.ดาวน์โหลด แบบฟอร์ม<br>
					2.กรอกรายชื่อ ตามแบบฟอร์ม<br>
					3.save file เป็นนามสกุล CSV<br>
					4.เปิด file ด้วยโปรแกรม notepad<br>
					5.save as และ เปลี่ยน Encoding เป็น UTF-8<br>
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


<!------ // แสดงผลการ  Update ******************  -->     
<!---------  เรียงลำดับ DataTable ----------->    
<script>
$(document).ready(function() {
    $('.datatable-desc').dataTable({
    "order": [[ 1, "desc" ]]
    } );
} );
</script>
<!--------- ปิด เรียงลำดับ DataTable ----------->   
<!------ // แสดงผลการ  Update ******************  -->   
