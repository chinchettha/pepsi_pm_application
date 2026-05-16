<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_equipment.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "Plan Work View";

if (empty($_SESSION['mem_id'])){
	$strSQL = "SELECT * FROM view_planwork ";
	//$tbl_policy = "SELECT * FROM view_confrim";
}else{
	//$strSQL = "SELECT * FROM view_planwork WHERE idwkctr='".$_SESSION['mem_id']."' ";
	$strSQL = "SELECT * FROM view_planwork WHERE idwkctr='".$_SESSION['mem_id']."'
AND syst !='CRTD' AND syst !='REL' ";
}
?>

                    <div class="container-fluid">
                        <h1 class="mt-4"><?php echo $title_page;?></h1>
                        <ol class="breadcrumb mb-4">
                            <li class="breadcrumb-item"><a href="index.php">Dashboard</a></li>
                            <li class="breadcrumb-item active"><?php echo $title_page;?></li>
                        </ol>
                        <!-- <div class="card mb-4">
                            <div class="card-body">ตารางรายการข้อมูล <?php echo $title_page;?></div>
                        </div> -->
                        <div class="card mb-4">


                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='100'>
                                        <thead class="thead-dark">
                                            <tr>
                                                <th>no.</th>
                                                <th>Work Order</th>
                                                <th>Manintenance plan</th>
                                                <th>Type</th>     
                                                <th>Equipment</th> 
                                                <th>Plan</th>     
                                                <th>New Plan</th>
                                                <th>Plan Close</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th>no.</th>
                                                <th>Work Order</th>
                                                <th>Manintenance plan</th>
                                                <th>Type</th>     
                                                <th>Equipment</th> 
                                                <th>Plan</th>     
                                                <th>New Plan</th>
                                                <th>Plan Close</th>
                                            </tr>
                                        </tfoot>
                                        <tbody>
<?php
$i=0;
$query = mysqli_query($link, $strSQL);
while($result = mysqli_fetch_array($query))
{
$i++;
?>
                                            <tr>
                                                <td><?php echo $i;?></td>
        <td><button type="button" onclick="return ShowOrder('<?PHP echo $result['idiw37']; ?>')" class="btn btn-xs" style="background-color:<?PHP echo $result["wkstcolor"]; ?>" ><?PHP echo $result["wkorder"]; ?></button></td>
        <td><?PHP echo $result["mntplan"]; ?></td>
        <td><?PHP echo  $result["wktype"]; ?></td>                                                
        <td><?PHP echo $result["equdescrip"]; ?></td> 
        <td><?PHP echo date("d.m.Y",$result["bscstart"]) ; ?></td>
        <td><?PHP if(!empty($result["cday"])){ echo date("d.m.Y",$result["cday"] ); } ?></td>
                                                <td align="center"><?PHP echo date("d.m.Y",$result["actfinish"]) ; ?></td>
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
