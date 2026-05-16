
<div class="chart tab-pane active" id="sales-task"
   style="position: relative; height: auto;">


<!-- Main content -->
<section class="content">

      <!-- Default box -->
	<!-- <div class="container-fluid"> -->
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">เพิ่มเติมรายละเอียดการปิดงาน <?php echo $_REQUEST['wkorder'];?></h4>
        </div>

		<form name="frmMain" id="frmMain" method="POST" action="<?php $PHP_SELF ?>?module=W_confirm_form&op=edit&idplanw=<?php echo $_SESSION['idplanw'];?>&idiw37=<?php echo $_SESSION['idiw37'];?>&wkorder=<?php echo $_SESSION['wkorder'];?>" enctype="multipart/form-data" onsubmit="return chk();">
		<input type="hidden" name="op" value="insert_comment">

			<div class="card-body">
				<div class="row">
					<div class="col-sm-12">
					  <div class="form-group">
						<label>เพิ่มเติมรายละเอียดการปิดงาน</label>
						<textarea name="comdetail" class="form-control" rows="5" placeholder="Enter ..." required><?php echo $result['comdetail'];?></textarea>
					  </div>
					</div>
				</div>
			</div>

			<!-- /.card-body -->
			<div class="card-footer">
			  <button type="submit" class="btn btn-success btn-lg"><i class="fas fa-save"></i> บันทึกเพิ่มเติมรายละเอียดการปิดงาน </button>
			  <button type="submit" class="btn btn-default float-right">ยกเลิก</button>
			</div>
		</form>


            <!-- Horizontal Form -->
            <div class="card card-info">
              <div class="card-header">
                <h4 class="card-title">รายการเพิ่มเติมรายละเอียดการปิดงาน</h4>
              </div>
              <!-- /.card-header -->
              <!-- form start -->

				<div class="table-responsive">
					<table border="1" class="table" id="" class="table table-bordered table-hover" width="100%">
						<thead class="thead-light">
						<tr>
							<th width="50">no</th>
							<th>รายละเอียด</th>
							<th>วัน/เวลาที่บันทึก</th>
							<th width="100">action</th>
						</tr>
						</thead>
						<?php
						//include('../include/connection.php');
						$strSQL_com = " SELECT * FROM tbconfirmcom where idiw37 ='".$_SESSION['idiw37']."' AND wkctr='".$_SESSION['wkctr']."'; ";
						//echo $strSQL_img;
						$query_com = mysqli_query($link, $strSQL_com);
						//$result = mysqli_fetch_array($query_com);
						$numrow_com = mysqli_num_rows($query_com);

						if ($numrow_com==0){
						?>
						<tr>
							<td colspan='4'><?php echo "<font color='red'>No Data.</font>";?></td>
						</tr>

						<?php
						}else{
						$i=0;
						while($result_com = mysqli_fetch_array($query_com)){
						$i++;
						?>
						<tr>
							<td><?php echo $i;?></td>
							<!-- <td><?php echo $result_com['comdetail'];?></td> -->
							<td><?php echo nl2br($result_com['comdetail']);?></td>
							<td><?php echo date("d.m.Y", $result_com['cfname']);?></td>
							<td>

							<!-- <a href="<?php $PHP_SELF ?>index2.php?module=W_confirm_form&idplanw=<?php echo $_REQUEST['idplanw'];?>&idiw37=<?php echo $_REQUEST['idiw37'];?>&wkorder=<?php echo $_REQUEST['wkorder'];?>&op=edit" data-id="<?php echo $result_com['id_img']; ?>" data-name="<?php echo $result_com['id_img']; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit btn-warning" data-toggle="tooltip" data-placement="top" title="แก้ไขข้อมูลนี้"><i class="fa fa-edit "></i> แก้ไข</a> -->

							<a href="pages/W_confirm_formcom_edit.php?idcom=<?php echo $result_com['idcom']?>&op=edit&idplanw=<?php echo $_REQUEST['idplanw'];?>&idiw37=<?php echo $_REQUEST['idiw37'];?>&wkorder=<?php echo $_REQUEST['wkorder'];?>" role="button" class="btn btn-outline-dark btn-sm btn-edit" data-toggle="modal" data-target="#ajaxLargeModal" data-placement="top" title="แก้ไขข้อมูลนี้"><i class="fa fa-edit"></i> แก้ไข</a>

							<!-- <a href="<?php $PHP_SELF ?>?module=W_confirm_form&op=del_comment&idcom=<?php echo $result_com['idcom']?>&idplanw=<?php echo $_SESSION['idplanw'];?>&idiw37=<?php echo $_SESSION['idiw37'];?>&wkorder=<?php echo $_SESSION['wkorder'];?>" data-toggle="tooltip" data-placement="top" title="ลบข้อมูลนี้" role="button" class="btn btn-outline-dark btn-sm btn-del btn-warning" ><i class="fa fa-trash"></i> ลบ</a> -->

							<a href="pages/W_confirm_formcom_edit.php?idcom=<?php echo $result_com['idcom']?>&op=del&idplanw=<?php echo $_REQUEST['idplanw'];?>&idiw37=<?php echo $_REQUEST['idiw37'];?>&wkorder=<?php echo $_REQUEST['wkorder'];?>" role="button" class="btn btn-outline-danger btn-sm btn-del" data-toggle="modal" data-target="#ajaxLargeModal" data-placement="top" title="ลบข้อมูลนี้"><i class="fa fa-trash"></i> ลบ</a>


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

        <!-- /.card-footer-->
      </div>
      <!-- /.card -->

	<!-- </div> -->
</section>


</div>


