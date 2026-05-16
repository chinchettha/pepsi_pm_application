<?PHP
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_iw37n.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

$title_page = "User Log";
$tbl_policy = "tbworkcenter_userlog";
$myfile = "M_UserLog";

$filed1 = "id"; // id คีย์หลัก
$filed2 = "userId";
$filed3 = "username";
$filed4 = "userIp";
$filed5 = "myIp";
$filed6 = "actionTime";
$filed7 = "action";

?>

                    <div class="container-fluid">
                        <h1 class="mt-4"><?PHP echo $title_page?></h1>
                        <ol class="breadcrumb mb-4">
                            <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                            <li class="breadcrumb-item active"><?PHP echo $title_page?></li>
                        </ol>
                        <div class="card mb-4">
                            <div class="card-body">ตารางรายการ <?PHP echo $title_page?></div>
                        </div>
                        <div class="card mb-4">
                            <div class="card-header">
							<i class="fas fa-table mr-1"></i><?PHP echo $_REQUEST['module']?>
								<!-- <div class="float-right">
								<a href="pages/<?PHP echo $myfile;?>_form.php" role="button" class="btn btn-dark btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="far fa-id-card nav-icon"></i>&nbsp;สร้างใหม่</a>
								</div> -->
							</div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover" id="dataTable" width="100%" cellspacing="0" data-page-length='50'>
                                        <thead class="thead-dark">
                                            <tr>
                                                <th>No.</th>
                                                <th>Date</th>
                                                <th>status</th>
                                                <th>userIp</th>
                                            </tr>
                                        </thead>
                                        <tfoot class="thead-dark">
                                            <tr>
                                                <th>No.</th>
                                                <th>Date</th>
                                                <th>status</th>
                                                <th>userIp</th>
                                            </tr>
                                        </tfoot>
                                        <tbody>
<?PHP
$num=0;
$strSQL = " SELECT * FROM $tbl_policy WHERE userId='".$_SESSION['mem_id']."' ";
$query = mysqli_query($link, $strSQL) or die ("Error Query [".$strSQL."]") ;
//echo $strSQL;
while($result = mysqli_fetch_array($query)){
$num++;
?>
                                            <tr>
                                                <td><?PHP echo $num;?></td>
                                                <td><?PHP echo $result[$filed6];?></td>  
                                                <td><?PHP echo $result[$filed7];?></td>  
                                                <td align="center"><?PHP echo $result[$filed5];?></td>
                                            </tr>
<?PHP } ?>

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
