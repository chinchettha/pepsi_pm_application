<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_iw37n.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "ข้อมูลนำเข้า Functional Form SAP";
$tbl_policy = "tbfunctional";
$myfile = "M_functional";
$fileload = "FunctionalLocation.xlsx";


$filed1 = "functionalloc"; // id คีย์หลัก
$filed2 = "funldescrip";
$filed3 = "functionallocsub";



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
        // <!------ // แสดงผลการ  Update ******************  -->
        ?>
        <div class="alert alert-warning alert-dismissible"> 
        <strong class="text-center"> ประมวลผลการนำเข้าข้อมูล........  </strong>
         <button type="button" class="close" data-dismiss="alert">&times;</button> 
         <table class="table table-bordered table-hover datatable-desc" id="dataTable2" width="100%" cellspacing="0" data-page-length='50'>
            <thead class="thead-dark">
                <tr class="text-center">
                    <th>Row</th>  
                    <th>Status</th>
                    <th>Functional loc.</th>                                                                                              
                    <th>Description</th>                     
                </tr>
            </thead>
        <?PHP  
        // <!------ // แสดงผลการ  Update ******************  --> 
        
        for($i=0;$i<$sheetCount;$i++){ 
            
            $Reader->ChangeSheet($i);
            $n = 1 ;
            foreach ($Reader as $Row){    
                if($n>2){ // นับแถวที่สองเป็นต้นไป

                // แสดงผลการ  Update ******************  -->    
        if (trim($Row[0]) == "" || trim($Row[1]) == "" ) { //colum ที่ต้องาการเช็คค่าว่าง   
            ?>
            <tr>
                <td class="text-center" ><?PHP echo $n ?></td>
                <td><strong> ผิดพลาด</strong>  FALSE...</td>
                <td><?PHP echo $Row[0] ?></td>
                <td><?PHP echo $Row[1] ?></td>             
            </tr>
        <?PHP    
        } else { // if ( $Row[0]== "" || $Row[1]=="" ) { //colum ที่ต้องาการเช็คค่าว่าง   
        // แสดงผลการ  Update ******************  -->
                    //ADD tb_iw37n
     
        //ค้นหาเลข workorder และ Opac ว่าซ้ำกันหรือไม่
        $SQLtw = "SELECT * FROM $tbl_policy where $filed1 ='".$Row[0]."' ";
        //echo $SQLtw;
        $querytw = mysqli_query($link, $SQLtw) or die ("Error Query [".$SQLtw."]");        
        $num = mysqli_num_rows($querytw);
        //echo $num;
        //ค้นหาเลข workorder
        if($num == 0){ //Check workorder ซ้ำ
            $strSQL = "";
            $strSQL = "INSERT $tbl_policy ($filed1,$filed2,$filed3) ";
            $strSQL .= " VALUES (\"$Row[0]\", \"$Row[1]\", \"$Row[2]\" )";            
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
           // echo "tb_iw37n ซ้ำ ". $strSQL  ."<br>" ;
           //Update  ตารางหลัก
          $sqlupdate_main = "UPDATE $tbl_policy SET ";
          $sqlupdate_main .= "  $filed1= \"$Row[0]\", $filed2= \"$Row[1]\",$filed3=  \"$Row[2]\" ";
          $sqlupdate_main .= " where $filed1 ='".$Row[0]."' ";
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
            <td><?PHP echo $Row[1] ?></td> 
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
     $sql = "SELECT * FROM $tbl_policy WHERE $filed1 = '" . $_REQUEST[$filed1] . "' ";
     $result_chk = $link->query($sql) or die ("Error Query [".$sql."]") ;
    // echo $sql;  

     // หากมีการกรอกข้อมูลแล้วให้ดำเนินการ Update
     if ($result_chk->num_rows > 0) {
          //Update  ตารางหลัก
          $sqlupdate_main = "UPDATE $tbl_policy SET ";
          $sqlupdate_main .= " $filed1= \"$_REQUEST[$filed1]\",  $filed2= \"$_REQUEST[$filed2]\", $filed3= \"$_REQUEST[$filed3]\" ";
          $sqlupdate_main .= " WHERE $filed1 = '" . $_REQUEST[$filed1] . "' ";
          $result = $link->query($sqlupdate_main) or die ("Error Query [".$sqlupdate_main."]") ;
		 // echo $sqlupdate_main;
     } else {
          $record_date = date("Y-m-d H:i:s");
          //ดำเนินการเพิ่มข้อมูลลงในตารางหลัก
          $strSQL = "INSERT $tbl_policy ($filed1,$filed2,$filed3) ";
            $strSQL .= " VALUES (\"$_REQUEST[$filed1]\",\"$_REQUEST[$filed2]\", \"$_REQUEST[$filed3]\" )";            
          $result = $link->query($strSQL) or die ("Error Query [".$strSQL."]") ;
		  //echo $sqlupdate_main;
     }

     //ย้อนกลับไปที่หน้า Policy นั้นๆ 
	 //echo "Swal.fire('Any fool can use a computer')";
     echo "<script>Swal.fire('Success!','You clicked the button!','success')</script>";
     //echo '<script>Swal.fire("Success!","' . $txt . '","success").then((value)=>{ window.location.href = "index.php?module=' . $myfile . '"; }); </script>';
     echo '<META HTTP-EQUIV="Refresh" CONTENT="0;URL=index2.php?module='.$myfile.'">';
     exit;
}

//หากมีการกดปุ่มลบ
if ($_REQUEST['op'] == "del") {
	 $sql_del = "DELETE FROM $tbl_policy WHERE $filed1 = '" . $_REQUEST[$filed1] . "' ";
     $link->query($sql_del);

     echo "<script>Swal.fire('Success!','You clicked the button!','success')</script>";
	 //echo "ลบข้อมูลเรียบร้อย";
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
<a href="pages/<?php echo $myfile;?>_form.php" role="button" class="btn btn-dark btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="far fa-id-card nav-icon"></i>&nbsp;สร้างใหม่</a>
								</div>
							</div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='50'>
                                        <thead class="thead-dark">
                                            <tr>
                                                <th>Functional loc.</th>  
                                                <th>Description</th>                                                                                              
                                                <th>Functional loc. Sub</th>                  
                                                <th>action</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th>Functional loc.</th>  
                                                <th>Description</th>                                                                                              
                                                <th>Functional loc. Sub</th>     
                                                <th>action</th>
                                            </tr>
                                        </tfoot>
                                        <tbody>
<?php
$strSQL = "SELECT * FROM $tbl_policy;";
$query = mysqli_query($link, $strSQL);
//echo $strSQL;
while($result = mysqli_fetch_array($query))
{
?>
                                            <tr>
                                                <td><?php echo $result[$filed1]; ?></td>
                                                <td><?php echo $result[$filed2];?></td>                                               
                                                <td><?php echo $result[$filed3];?></td>                                          
                                                <td align="center">
												<a href="pages/<?php echo $myfile;?>_form.php?op=edit&<?php echo $filed1;?>=<?php echo $result[$filed1];?>" data-id="<?php echo $result[$filed1]; ?>" data-name="<?php echo $result[$filed2]; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-edit"></i> แก้ไข</a>
												<a href="pages/<?php echo $myfile;?>_form.php?op=del&<?php echo $filed1;?>=<?php echo $result[$filed1];?>" data-id="<?php echo $result[$filed1]; ?>" data-name="<?php echo $result[$filed2]; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-trash"></i> ลบ</a>

												</td>
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
