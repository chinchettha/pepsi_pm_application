<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_iw37n.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "ข้อมูลนำเข้า IW37N From SAP";
$tbl_policy = "tbiw37n";
$myfile = "M_iw37n";
$fileload = "iw37n.xlsx";
$lim = "1000"; // จำนวนข้อมูลที่แสดง

$filed1 = "idiw37"; // id คีย์หลัก
$filed2 = "mntplan";
$filed3 = "wkorder";
$filed4 = "wktype";
$filed5 = "mat";
$filed6 = "bscstart";
$filed7 = "actfinish";
$filed8 = "systemstatus";
$filed9 = "syst";
$filed10 = "opac";
$filed11 = "operationshorttext";
$filed12 = "ostdescription";
$filed13 = "cknow";
$filed14 = "wkctr";
$filed15 = "work";
$filed16 = "actwork";
$filed17 = "untime";
$filed18 = "equipment";
$filed19 = "equdescrip";
$filed20 = "functionalloc";
$filed21 = "funcdescrip";
$filed22 = "team";


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
                    <th>Order</th>                                                                                              
                    <th>Bsc start</th>
                    <th>OpAc</th>
                    <th>Operation short text</th>            
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
        if (trim($Row[1]) == "" || trim($Row[2]) == "" || trim($Row[4]) == "" || trim($Row[6]) == "" || trim($Row[7]) == "" || trim($Row[8]) == "" || trim($Row[17]) == "" || trim($Row[18]) == "") { //colum ที่ต้องาการเช็คค่าว่าง   
            ?>
            <tr>
                <td class="text-center" ><?PHP echo $n ?></td>
                <td><strong> ผิดพลาด</strong>  FALSE...</td>
                <td><?PHP echo $Row[1] ?></td>
                <td><?PHP echo $Row[4] ?></td>
                <td><?PHP echo $Row[7] ?></td>
                <td ><?PHP echo $Row[8] ?></td>
            </tr>
        <?PHP    
        } else { // if ( $Row[0]== "" || $Row[1]=="" ) { //colum ที่ต้องาการเช็คค่าว่าง   
        // แสดงผลการ  Update ******************  -->
                    //ADD tb_iw37n
        
        //แปลงวันที่
        if(!empty(trim($Row[4]))){
            $BscStart = explode(".", $Row[4]);          
            $bscstart = mktime(0, 0, 0, $BscStart[1], $BscStart[0], $BscStart[2]);  
        }
        
        if(!empty($Row[5])  && trim($Row[5]) <> "" ){
            $ActFinish = explode(".", $Row[5]);          
            $actfinish = mktime(0, 0, 0, $ActFinish[1], $ActFinish[0], $ActFinish[2]);
        } else {
            $actfinish = "";
        }        
        //แปลงวันที่

        //หาสถานะงาน
        $SystemStatus = explode(" ", $Row[6]);     
        if($SystemStatus[0]=="REL" ||  $SystemStatus[0]=="CRTD" ) {    
            $syst = $SystemStatus[0];
        } else {
            $syst = $SystemStatus[0].' '.$SystemStatus[1] ;            
        }
        //หาสถานะงาน

        //ค้นหาเลข workorder และ Opac ว่าซ้ำกันหรือไม่
        $SQLtw = "SELECT * FROM $tbl_policy where $filed3 ='".$Row[1]."' and $filed10='".$Row[7]."' ";
        //echo $SQLtw;
        $querytw = mysqli_query($link, $SQLtw) or die ("Error Query [".$SQLtw."  ]");       
        $num = mysqli_num_rows($querytw);
        //echo $num;
        //ค้นหาเลข workorder
        if($num == 0){ //Check workorder ซ้ำ
            $strSQL = "";
            $strSQL = "INSERT $tbl_policy ($filed2,$filed3,$filed4,$filed5,$filed6,$filed7,$filed8,$filed9,$filed10,$filed11,$filed12,$filed13,$filed14,$filed15,$filed16,$filed17,$filed18,$filed19,$filed20,$filed21,$filed22) ";
            $strSQL .= " VALUES ('".$Row[0]."', '".$Row[1]."', '".$Row[2]."', '".$Row[3]."', '".$bscstart."', '".$actfinish."', '".$Row[6]."', '".$syst."', '".$Row[7]."', \"".$Row[8]."\", \"".$Row[9]."\", '".$Row[10]."', '".$Row[11]."', '".$Row[12]."', '".$Row[13]."', '".$Row[14]."', '".$Row[15]."','".$Row[16]."','".$Row[17]."','".$Row[18]."','' )";            
            $result = mysqli_query($link, $strSQL) or die ("Error Query [".$strSQL."] ");            
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
          $sqlupdate_main .= "  $filed2 = '".$Row[0]."', $filed3= '".$Row[1]."', $filed4= '".$Row[2]."',$filed5=  '".$Row[3]."', $filed6= '".$bscstart."', $filed7= '".$actfinish."', $filed8= '".$Row[6]."', $filed9= '".$syst."', $filed10= '".$Row[7]."', $filed11= \"".$Row[8]."\", $filed12= \"".$Row[9]."\", $filed13= '".$Row[10]."', $filed14= '".$Row[11]."', $filed15= '".$Row[12]."', $filed16= '".$Row[13]."', $filed17= '".$Row[14]."', $filed18= '".$Row[15]."',$filed19= '".$Row[16]."',$filed20= '".$Row[17]."',$filed21= '".$Row[18]."' ";
          $sqlupdate_main .= " WHERE $filed3 = '" . $Row[1] . "' and $filed10='".$Row[7]."' ";
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
            <td><?PHP echo $Row[1] ?></td>
            <td><?PHP echo $Row[4] ?></td>
            <td><?PHP echo $Row[7] ?></td>
            <td ><?PHP echo $Row[8] ?></td>
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
     $result_chk = $link->query($sql);
     //echo $sql;
     
     //หาวันที่
     if(!empty(trim($_REQUEST[$filed6]))){
        $bscstart = explode('.' , $_REQUEST[$filed6] ) ;
        $bscstart = mktime(0,0,0,$bscstart[1],$bscstart[0],$bscstart[2]);
     }else{
         $bscstart = "";
     }
     if(!empty(trim($_REQUEST[$filed7]))){
        $actstart = explode('.', $_REQUEST[$filed7] );
        $actstart = mktime(0,0,0,$actstart[1],$actstart[0],$actstart[2]);
     }else{
         $actstart = "";
     }

     //หาวันที่

     // หากมีการกรอกข้อมูลแล้วให้ดำเนินการ Update
     if ($result_chk->num_rows > 0) {
          //Update  ตารางหลัก
          $sqlupdate_main = "UPDATE $tbl_policy SET ";
          $sqlupdate_main .= " $filed2='" . $_REQUEST[$filed2] . "',$filed3='" . $_REQUEST[$filed3] . "',$filed4='" . $_REQUEST[$filed4] . "',$filed5='" . $_REQUEST[$filed5] . "',$filed6='" . $bscstart . "',$filed7='" . $actstart . "',$filed8='" . $_REQUEST[$filed8] . "',$filed10='" . $_REQUEST[$filed10] . "',$filed11='" . $_REQUEST[$filed11] . "',$filed12='" . $_REQUEST[$filed12] . "',$filed13='" . $_REQUEST[$filed13] . "',$filed14='" . $_REQUEST[$filed14] . "',$filed15='" . $_REQUEST[$filed15] . "',$filed16='" . $_REQUEST[$filed16] . "',$filed17='" . $_REQUEST[$filed17] . "',$filed18='" . $_REQUEST[$filed18] .  "',$filed19='" . $_REQUEST[$filed19] . "',$filed20='" . $_REQUEST[$filed20] . "',$filed21='" . $_REQUEST[$filed21] ."' ";
          $sqlupdate_main .= " WHERE $filed1 = '" . $_REQUEST[$filed1] . "' ";
          $result = $link->query($sqlupdate_main);
		  //echo $sqlupdate_main;
     } else {
          $record_date = date("Y-m-d H:i:s");
          //ดำเนินการเพิ่มข้อมูลลงในตารางหลัก
          $sqlinsert_main = "INSERT $tbl_policy ($filed2,$filed3,$filed4,$filed5,$filed6,$filed7,$filed8,$filed10,$filed11,$filed12,$filed13,$filed14,$filed15,$filed16,$filed17,$filed18,$filed19,$filed20,$filed21) VALUES ('" . $_REQUEST[$filed2] . "','" . $_REQUEST[$filed3] . "','" . $_REQUEST[$filed4] . "','" . $_REQUEST[$filed5] . "','" . $bscstart . "','" . $actstart . "','" . $_REQUEST[$filed8] . "','" . $_REQUEST[$filed10] . "','" . $_REQUEST[$filed11] . "','" . $_REQUEST[$filed12] . "','" . $_REQUEST[$filed13] . "','" . $_REQUEST[$filed14] . "','" . $_REQUEST[$filed15] . "','" . $_REQUEST[$filed16] . "','" . $_REQUEST[$filed17] . "','" . $_REQUEST[$filed18] .  "','" . $_REQUEST[$filed19] .  "','" . $_REQUEST[$filed20] .  "','" . $_REQUEST[$filed21] ."')";
          $result = $link->query($sqlinsert_main);
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
								<!--<a href="#" role="button" class="btn btn-warning btn-create float-right" data-toggle="modal" data-target=".preview"><i class="far fa-id-card nav-icon"></i>&nbsp;ส่งออกไฟล์ข้อมูล</a>  -->
								<a href="pages/<?php echo $myfile;?>_imports.php" role="button" class="btn btn-success btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-upload nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูล</a>
								<a href="pages/<?php echo $myfile;?>_form.php" role="button" class="btn btn-dark btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="far fa-id-card nav-icon"></i>&nbsp;สร้างใหม่</a>
								</div>
							</div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='50'>
                                        <thead class="thead-dark">
                                            <tr>
                                                <th>Order</th>
                                                <th>MntPlan</th>
                                                <th>Type</th>
                                                <th>Bsc start</th>
                                                <th>action</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th>Order</th>
                                                <th>MntPlan</th>
                                                <th>Type</th>
                                                <th>Bsc start</th>
                                                <th>action</th>
                                            </tr>
                                        </tfoot>
                                        <tbody>
<?php
$strSQL = "SELECT * FROM $tbl_policy  order by idiw37 DESC  limit 0,$lim "; //**************เพิ่ม จำกัดจำนวนแสดงข้อมูล */
$query = mysqli_query($link, $strSQL);
//echo $strSQL;
while($result = mysqli_fetch_array($query))
{
?>
                                            <tr>
                                                <td><?php echo $result[$filed3];?></td>
                                                <td><?php echo $result[$filed2];?></td>
                                                <td><?php echo $result[$filed4];?></td>
                                                <td><?php  if(!empty(trim($result[$filed6]))){ echo date("d.m.Y", $result[$filed6]) ;} ;?></td>
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