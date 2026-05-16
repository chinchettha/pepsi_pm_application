
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" crossorigin="anonymous">
<link href="plugins/fileinput/css/fileinput.css" media="all" rel="stylesheet" type="text/css"/>
<!-- <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" crossorigin="anonymous"> -->
<!-- <link href="plugins/fileinput/themes/explorer-fas/theme.css" media="all" rel="stylesheet" type="text/css"/> -->
<!-- <script src="https://code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
<script src="plugins/fileinput/js/plugins/piexif.js" type="text/javascript"></script>
<script src="plugins/fileinput/js/plugins/sortable.js" type="text/javascript"></script> -->
<script src="plugins/fileinput/js/fileinput.js" type="text/javascript"></script>
<!-- <script src="plugins/fileinput/js/locales/fr.js" type="text/javascript"></script>
<script src="plugins/fileinput/js/locales/es.js" type="text/javascript"></script>
<script src="plugins/fileinput/themes/fas/theme.js" type="text/javascript"></script>
<script src="plugins/fileinput/themes/explorer-fas/theme.js" type="text/javascript"></script> -->


<?php
$datenow = date("Y-m-d", mktime(0, 0, 0, date("m"), date("d"), date("Y")));
$date = date("Y-m-d H:i:sa");
if (preg_match('/([0-9]{1,4})(\-[0-9]{1,2}\-[0-9]{1,2}(\s[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2})?)/', $date, $match)) {
  //echo ($match[1] - 543).$match[2];
  //echo ($match[1] + 543).$match[2];
}
//$register_date  = date("d.m.Y", $_REQUEST['txt_date']);

$title_page = "Add images";
$tbl_policy = "tbl_register";
$myfile = "W_confirm_formimg";

//$filed_id = "id"; // id คีย์หลัก


?>

<div class="content-wrapper">

    <!-- Main content -->
    <section class="content">
        <div class="row">
          <!-- left column -->
          <div class="col-md-6">

            <!-- Horizontal Form -->
            <div class="card card-info">
              <div class="card-header">
                <h4 class="card-title"><i class="fa fa-camera"></i>&nbsp;<i class="far fa-image"></i>&nbsp;แทรกภาพถ่ายจากอุปกรณ์</h4>
              </div>
              <!-- /.card-header -->
              <!-- form start -->
			  <div class="card-body">


				<form name="frmMain" id="frmMain" method="POST" action="<?php $PHP_SELF ?>?module=W_confirm_form&op=edit&idplanw=<?php echo $_SESSION['idplanw'];?>&idiw37=<?php echo $_SESSION['idiw37'];?>&wkorder=<?php echo $_SESSION['wkorder'];?>" enctype="multipart/form-data" onsubmit="return chk();">
				<input type="hidden" name="op" value="insert_img">

                  <div class="form-group">
                    <!-- <label for="customFile"><i class="fa fa-camera"></i>&nbsp;<i class="far fa-image"></i>&nbsp;แทรกภาพถ่ายจากอุปกรณ์</label> -->
                    <div class="custom-file">

                      <!-- <input type="file" class="custom-file-input" id="customFile">
                      <label class="custom-file-label" for="customFile">Choose file</label> -->


						<!-- แบบที่ 1 -->

							<!-- <input id="input-1" type="file" name="fileUpload" class="" data-show-upload="true" accept=".jpg ,.jpeg ,.png ,.gif" > -->
							<!-- <input type="file" id="fileUpload" name="fileUpload" class="form-control" accept=".jpg,.jpeg" data-browse-on-zone-click="true">

							<script>
							$(document).ready(function() {
								$("#fileUpload").fileinput({
									rtl: true,
									dropZoneEnabled: false,
									allowedFileExtensions: ["jpg","jpeg"]
								});
							});
							</script> -->


						<!-- แบบที่ 2 -->

						<div class="file-loading">
							<input id="fileUpload" name="fileUpload" type="file" class="file" data-browse-on-zone-click="true">
								<script>
									$(document).ready(function() {
										$("#fileUpload").fileinput({
											rtl: true,
											dropZoneEnabled: false,
											allowedFileExtensions: ["jpg","jpeg"]
										});

										$("#file-1").fileinput({
											theme: 'fas',
											uploadUrl: '#', // you must set a valid URL here else you will get an error
											allowedFileExtensions: ['jpg', 'jpg', 'png', 'gif'],
											overwriteInitial: false,
											maxFileSize: 1000,
											maxFilesNum: 10,
											//allowedFileTypes: ['image', 'video', 'flash'],
											slugCallback: function (filename) {
												return filename.replace('(', '_').replace(']', '_');
											}
										});

									});
								</script>
						</div>

                    </div>

                  </div>
                  <div class="form-group">
                  </div>
                </form>


			  </div>
            </div>
            <!-- /.card -->
            <!-- Horizontal Form -->
            <div class="card card-info">
              <div class="card-header">
                <h4 class="card-title">รายการภาพประกอบ</h4>
              </div>
              <!-- /.card-header -->
              <!-- form start -->

				<div class="table-responsive">
					<table border="1" class="table" id="" class="table table-bordered table-hover" width="100%">
						<thead class="thead-light">
						<tr>
							<th width="50">no</th>
							<th>ภาพประกอบ</th>
							<!-- <th>ชื่อไฟล์ภาพ</th> -->
							<th>วัน/เวลาที่ส่ง</th>
							<th width="100">action</th>
						</tr>
						</thead>
						<?php
						//include('../include/connection.php');
						$strSQL_img = " SELECT * FROM tbconfirmimg where idiw37 ='".$_SESSION['idiw37']."' AND wkctr='".$_SESSION['wkctr']."'; ";
						//echo $strSQL_img;
						$query_img = mysqli_query($link, $strSQL_img);
						//$result = mysqli_fetch_array($query_img);
						$numrow_img = mysqli_num_rows($query_img);

						if ($numrow_img==0){
						?>
						<tr>
							<td colspan='4'><?php echo "<font color='red'>No images.</font>";?></td>
						</tr>

						<?php
						}else{
						$i=0;
						while($result_img = mysqli_fetch_array($query_img)){
						$i++;
						?>
						<tr>
							<td><?php echo $i;?></td>
							<td>
							<a href="imgComfirm/<?php echo $result_img['cfilename'];?>" target="_blank" data-toggle="tooltip"  data-placement="top" title="<?php echo $result_img['cfilename'];?>"><img src="imgComfirm/<?php echo $result_img['cfilename'];?>" class="img-thumbnail img-rounded" style="width:64px; height: auto;"></a>
							
							<!-- <a href="pages/popup_showimg.php?id_img=<?php echo $result_img['id_img'];?>" data-id="<?php echo $result_img['id_img']; ?>" data-name="<?php echo $result_img['id_img'];?>" role="button" class="btn btn-outline-dark btn-sm btn-edit btn-info" data-toggle="modal" data-target="#ajaxLargeModal"><img src="images/<?php echo $result_img['wrk_image'];?>" class="img-thumbnail img-rounded" style="width:64px; height: auto;"></a> -->

							</td>
							<!-- <td><?php echo $result_img['cfilename'];?></td> -->
							<td><?php echo date("d.m.Y", $result_img['cfname']);?></td>
							<td>
							<!-- <a href="<?php $PHP_SELF ?>index2.php?module=W_confirm_form&idcimg=<?php echo $result_img['idcimg']?>&op=edit_img" data-id="<?php echo $result_img['id_img']; ?>" data-name="<?php echo $result_img['id_img']; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit btn-warning" ><i class="fa fa-edit "></i> แก้ไข</a> -->
							<a href="<?php $PHP_SELF ?>?module=W_confirm_form&op=del_img&idcimg=<?php echo $result_img['idcimg']?>&idplanw=<?php echo $_SESSION['idplanw'];?>&idiw37=<?php echo $_SESSION['idiw37'];?>&wkorder=<?php echo $_SESSION['wkorder'];?>&cfilename=<?php echo $result_img['cfilename']?>" data-toggle="tooltip" data-placement="top" title="ลบข้อมูลนี้" role="button" class="btn btn-outline-dark btn-sm btn-del btn-warning" ><i class="fa fa-trash"></i> ลบ</a>

							<!-- <a href="<?php $PHP_SELF ?>?module=W_confirm_form&op=del_img&idcimg=<?php echo $result_img['idcimg']?>&idplanw=<?php echo $_SESSION['idplanw'];?>&idiw37=<?php echo $_SESSION['idiw37'];?>&wkorder=<?php echo $_SESSION['wkorder'];?>&cfilename=<?php echo $result_img['cfilename']?>" data-href="<?php $PHP_SELF ?>?module=W_confirm_form&op=del_img&idcimg=<?php echo $result_img['idcimg']?>&idplanw=<?php echo $_SESSION['idplanw'];?>&idiw37=<?php echo $_SESSION['idiw37'];?>&wkorder=<?php echo $_SESSION['wkorder'];?>&cfilename=<?php echo $result_img['cfilename']?>" data-id="<?php echo $result_img['idcimg']?>" data-name="#<?php echo $result_img['idcimg']?>" role="button" class="btn btn-outline-danger btn-sm btn-delete"><i class="fa fa-trash"></i> ลบ</a> -->


							</td>
						</tr>

						<?php
							}//if ($numrow_img==0){
						}//while
						?>		
					</table>
				</div>

            </div>
            <!-- /.card -->

          </div>
          <!--/.col (left) -->

          <!-- right column -->
          <div class="col-md-6 text-info">

				<?php
				$tb1 = "view_order";

				$Events =  $_REQUEST["wkorder"]; //รับค่อ Ajax แบบ Post
				$id =  $Events[0];


				$SqlTB1 = " SELECT * FROM  $tb1 where  wkorder= '".$_REQUEST['wkorder']."'  ";
				$qrTB1 = mysqli_query($link, $SqlTB1) or die ("Error Query [".$SqlTB1."]");
				$totalTB1 = mysqli_num_rows($qrTB1);

				if($totalTB1 >0){
					$rsTB1 = mysqli_fetch_array($qrTB1);
					$idiw37 = $rsTB1["idiw37"];

				?>
				<div class="row">
					<div class="row col-12">
						<div class="col-3"> <strong>Work Order</strong>  </div>
						<div class="col"> <?PHP  echo $rsTB1["wkorder"];?>   </div>
					</div>
					<div class="row col-12">
						<div class="col-3">  <strong><?PHP echo  date("d.m.Y");?></strong>  </div>
						<div class="col"> 80004546 คณะกรรมการควบคุม  Orignal 0 page 1   </div>
					</div>
					<!-- <div class="col-3"> <img src="img/lays-logoX.png" width="24" class="img-thumbnail" alt="Cinque Terre"> </div> -->
				</div>

				<div class="row" > 
					<div  class="col-12"> <strong>Functional Location</strong> : <?PHP  echo $rsTB1["functionalloc"];?> </div>
					<div class="col-12"> <strong>Description</strong> : <?PHP  echo $rsTB1["funcdescrip"];?> </div>
				</div>
				<div class="row" > 
					<div  class="col-12"> <strong>Equipment</strong>  :  <?PHP  echo $rsTB1["equipment"];?> </div>
					<div class="col-12"> <strong>Description</strong> : <?PHP  echo $rsTB1["equdescrip"];?> </div>
				</div>
				<hr style="height:2px;border-width:1;">
				<div class="row"> 
					<div class="col-12"> <strong>Order Header Details</strong> </div>
				</div>
				<div class="row">
					<div class="col-6"> <strong>Work Centre</strong> : <?PHP  echo $rsTB1["wkctr"];?>  </div>
					<div class="col-6"> <strong>Priority</strong> :  </div>
				</div>
				<div class="row">
					<div class="col-6"> <strong>Start Date</strong> : <?PHP  if(!empty(trim($rsTB1["bscstart"]))){ echo  date("d.m.Y", $rsTB1["bscstart"]); }?> </div>
					<div class="col-6"> <strong>End Date</strong> : <?PHP   if(!empty(trim($rsTB1["actfinish"]))) { echo  date("d.m.Y", $rsTB1["actfinish"]); }?>  </div>
				</div>
				<div class="row">
					<div class="col-6"> <strong>Activity Type</strong> : <?PHP echo  sprintf("%03d", $rsTB1["mat"])  ;?>  - <?PHP  echo $rsTB1["matdescrip"];?>      </div>
					<div class="col-6"> <strong>Tech Id</strong>:  </div>
				</div>
				<hr style="height:2px;border-width:1;">
				<div class="row">
					<div class="col-12"> <strong>Deacription</strong> : </div>
				</div>
				<div class="row">
					<div class="col-12"> No Permits Found </div>
				</div>
				<hr style="height:2px;border-width:1;">
				<div class="row">
					<div class="col-12"> <strong>Header Short Text</strong> :  <?PHP echo $rsTB1["ostdescription"]  ;?>    </div>
				</div>
				<hr style="height:2px;border-width:1;">
				<div class="row">
					<div class="col-6"> <strong>Operation</strong> :  <?PHP echo  sprintf("%04d", $rsTB1["opac"])  ;?>    </div>
					<div class="col-6"> <strong>Work Centre</strong> :  <?PHP echo  $rsTB1["wkctr"];?>    </div>
				</div>
				<div class="row">
					<div class="col-12"> <strong>Operation Text</strong> :  <?PHP echo  $rsTB1["operationshorttext"]  ;?>    </div>
				</div>
				<div class="row">
					<div class="col-12"> <strong>Operation Long Text</strong> :     </div>
				</div>
				<div class="row">
					<div class="col-12"> <?PHP echo  $rsTB1[""]  ;?>    </div>
				</div>
				<hr style="height:2px;border-width:1;">
				<!------- Show Order Detail  ------->
				<?PHP  
				}else {
					echo "ไม่พบเลข Work Order";
					echo $SqlTB1;
				} // end if($totalTB1 >0){


				?>

          </div>
          <!--/.col (right) -->
        </div>
        <!-- /.row -->
    </section>
    <!-- /.content -->


</div>




