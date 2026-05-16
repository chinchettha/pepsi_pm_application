
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
$myfile = "W_confirm_formimg2";

//$filed_id = "id"; // id คีย์หลัก

?>

<div class="content-wrapper">

    <!-- Main content -->
    <section class="content">
      <div class="container-fluid">
        <div class="row">
          <!-- left column -->
          <div class="col-md-6">

            <!-- Horizontal Form -->
            <div class="card card-info">
              <div class="card-header">
                <h3 class="card-title">เพิ่มเติมรายละเอียดการปิดงาน</h3>
              </div>
              <!-- /.card-header -->
              <!-- form start -->
			  <div class="card-body">
				Maintenance Plan : <strong><code><?php echo $_SESSION['mntplan'];?></code></strong> 
				<br>PM Task detail : <code>is also available for a darker option.</code>
				<br>Descriptionwork : <code><?php echo $result['descriptionwork'];?></code>
				<br>Functlocescrdip : <code><?php echo $result['functlocescrdip'];?></code> 
				<br>idplanw : <code><?php echo $_SESSION['idplanw'];?></code> 
				<br>idwkctr : <code><?php echo $_SESSION['mem_id'];?></code> 
				<br>wkctr : <code><?php echo $_SESSION['wkctr'];?></code> 
				<br>idiw37 : <code><?php echo $_SESSION['idiw37'];?></code> 
				<br>wkorder : <code><?php echo $_SESSION['wkorder'];?></code> 
			  </div>
            </div>
            <!-- /.card -->
            <!-- Horizontal Form -->
            <div class="card card-info">
              <div class="card-header">
                <h3 class="card-title">รายการภาพประกอบ</h3>
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
						//if ($numrow==0)
						//{
						//	echo "<font color='red'>No images.</font>";
						//}
						$i=0;
						while($result_img = mysqli_fetch_array($query_img)){
							$i++;
						?>

						<tr>
							<td><?php echo $i;?></td>
							<td>
							<a href="imgComfirm/<?php echo $result_img['cfilename'];?>" target="_blank"><img src="imgComfirm/<?php echo $result_img['cfilename'];?>" class="img-thumbnail img-rounded" style="width:64px; height: auto;"></a>
							
							<!-- <a href="pages/popup_showimg.php?id_img=<?php echo $result_img['id_img'];?>" data-id="<?php echo $result_img['id_img']; ?>" data-name="<?php echo $result_img['id_img'];?>" role="button" class="btn btn-outline-dark btn-sm btn-edit btn-info" data-toggle="modal" data-target="#ajaxLargeModal"><img src="images/<?php echo $result_img['wrk_image'];?>" class="img-thumbnail img-rounded" style="width:64px; height: auto;"></a> -->

							</td>
							<!-- <td><?php echo $result_img['cfilename'];?></td> -->
							<td><?php echo $result_img['cfname'];?></td>
							<td>
							<!-- <a href="<?php $PHP_SELF ?>index2.php?module=W_confirm_form&idcimg=<?php echo $result_img['idcimg']?>&op=edit_img" data-id="<?php echo $result_img['id_img']; ?>" data-name="<?php echo $result_img['id_img']; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit btn-warning" ><i class="fa fa-edit "></i> แก้ไข</a> -->
							<a href="<?php $PHP_SELF ?>index2.php?module=W_confirm_form&idcimg=<?php echo $result_img['idcimg']?>&op=del_img" data-id="<?php echo $result_img['id_img']; ?>" data-name="<?php echo $result_img['id_img']; ?>" role="button" class="btn btn-outline-dark btn-sm btn-del btn-warning" ><i class="fa fa-trash"></i> ลบ</a>
							</td>
						</tr>

						<?php
						}
						?>		
					</table>
				</div>

            </div>
            <!-- /.card -->

          </div>
          <!--/.col (left) -->
          <!-- right column -->
          <div class="col-md-6">

            <!-- general form elements disabled -->
            <div class="card card-secondary">
              <div class="card-header">
                <h3 class="card-title">Custom Elements</h3>
              </div>
              <!-- /.card-header -->
              <div class="card-body">

				<form name="frmMain" id="frmMain" method="POST" action="<?php $PHP_SELF ?>?module=W_confirm_form" enctype="multipart/form-data" onsubmit="return chk();">
				<input type="hidden" name="op" value="insert_img">
                  <div class="form-group">
                    <label for="customFile"><i class="fa fa-camera"></i>&nbsp;<i class="far fa-image"></i>&nbsp;แทรกภาพถ่ายจากอุปกรณ์</label>
                    <div class="custom-file">
                      <!-- <input type="file" class="custom-file-input" id="customFile">
                      <label class="custom-file-label" for="customFile">Choose file</label> -->


						<!-- แบบที่ 1 -->

							<!-- <input id="input-1" type="file" name="fileUpload" class="" data-show-upload="true" accept=".jpg ,.jpeg ,.png ,.gif" > -->
							<input type="file" id="fileUpload" name="fileUpload" class="form-control" accept=".jpg,.jpeg" data-browse-on-zone-click="true">

							<script>
							$(document).ready(function() {
								$("#fileUpload").fileinput({
									rtl: true,
									dropZoneEnabled: false,
									allowedFileExtensions: ["jpg","jpeg"]
								});
							});
							</script>


						<!-- แบบที่ 2 -->

						<!-- <div class="file-loading">
							<input id="file-1" name="file-1" type="file" class="file" data-browse-on-zone-click="true">
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
						</div> -->

                    </div>

                  </div>
                  <div class="form-group">
                  </div>
                </form>
              </div>
              <!-- /.card-body -->
            </div>
            <!-- /.card -->
          </div>
          <!--/.col (right) -->
        </div>
        <!-- /.row -->
      </div><!-- /.container-fluid -->
    </section>
    <!-- /.content -->


</div>




