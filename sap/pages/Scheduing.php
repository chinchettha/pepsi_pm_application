<!-- plugin How to Export the jQuery Datatable data to PDF,Excel,CSV and Copy -->
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/r/dt/jq-2.1.4,jszip-2.5.0,pdfmake-0.1.18,dt-1.10.9,af-2.0.0,b-1.0.3,b-colvis-1.0.3,b-html5-1.0.3,b-print-1.0.3,se-1.0.1/datatables.min.css"/>
<script type="text/javascript" src="https://cdn.datatables.net/r/dt/jq-2.1.4,jszip-2.5.0,pdfmake-0.1.18,dt-1.10.9,af-2.0.0,b-1.0.3,b-colvis-1.0.3,b-html5-1.0.3,b-print-1.0.3,se-1.0.1/datatables.min.js"></script>
<!-- plugin How to Export the jQuery Datatable data to PDF,Excel,CSV and Copy -->

<div class="content-page">
	<!-- Start content -->
	<div class="content">
		<div class="container-fluid">


	<!-- Content Header (Page header) -->
    <div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0 text-dark">Scheduing</h1>
          </div><!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item"><a href="index.php">หน้าหลัก</a></li>
              <li class="breadcrumb-item active">Scheduing</li>
            </ol>
          </div><!-- /.col -->
        </div><!-- /.row -->
      </div><!-- /.container-fluid -->
    </div>
    <!-- /.content-header -->


          <div class="card">
            <div class="card-header">
              <h3 class="card-title"><i class="fa fa-table"></i>&nbsp;ข้อมูลรายการ</h3>
				<div class="float-right">

				<!-- <button type="submit" class="btn btn-info">Sign in</button>
				<button type="submit" class="btn btn-default float-right"></button> -->
					<!-- <div class="btn-group" role="group">
						<a id="btnGroupDrop1" role="button" href="#" class="btn btn-secondary float-right  dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							<i class="fa fa-file-excel-o"></i>
							ส่งออก Excel</a>
						<div class="dropdown-menu" aria-labelledby="btnGroupDrop1" x-placement="bottom-start" style="position: absolute; transform: translate3d(2px, 38px, 0px); top: 0px; left: 0px; will-change: transform;">
							<a class="dropdown-item btn-export-borrow" href="#">Excel</a>
							<a class="dropdown-item btn-export-borrow-list" href="#">csv</a>
						</div>
					</div> -->

				<a href="temp_file/temp_member.csv" role="button" class="btn btn-info btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="far fa-id-card nav-icon"></i>&nbsp;ตัวอย่างแบบฟอร์ม</a>
				<a href="pages/member_form.php" role="button" class="btn btn-warning btn-create float-right" data-toggle="modal" data-target=".preview"><i class="far fa-id-card nav-icon"></i>&nbsp;การเตรียม File</a>
				<a href="pages/member_import.php" role="button" class="btn btn-success btn-success float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-download nav-icon"></i>&nbsp;นำเข้าไฟล์ข้อมูล</a>
				<a href="pages/member_form.php" role="button" class="btn btn-dark btn-create float-right" data-toggle="modal" data-target="#ajaxLargeModal"><i class="far fa-id-card nav-icon"></i>&nbsp;สร้างใหม่</a>

				</div>
            </div>
            <!-- /.card-header -->
            <div class="card-body">
			<div class="table-responsive">

              <table id="example1" class="table table-bordered table-striped">
                <thead>
                <tr>
					<th>No.</th>
					<th>MntPlan</th>
					<th>MaintPlan dscrptn</th>
					<th>Call No.</th>
					<th>PlanDate</th>
					<th>Mn.wk.ctr</th>
					<th>การกระทำ</th>
                </tr>
                </thead>
                <tbody>
					<!-- <tr role="row" class="odd">
						<td class="sorting_1"><a href="<?php $PHP_SELF ?>?module=member_form" data-id="5" data-toggle="modal" data-target="#ajaxLargeModal" class="btn-edit">01544542101</a> </td>
						<td><a href="<?php $PHP_SELF ?>?module=member_form" data-id="5" data-toggle="modal" data-target="#ajaxLargeModal" class="btn-edit">สมปอง มหาดี</a> </td>
						<td>คลังสินค้า</td>
						<td>อาจารย์</td>
						<td><span class="fa fa-check"></span></td>
						<td>
						<a href="https://www.bahtsoft.com/demo_eqborrow/borrow/pdf/18?page=a4" role="button" class="btn btn-sm btn-outline-dark" target="_blank"><i class="fa fa-print"></i>  A4</a>
						<a href="pages/member_form.php" role="button" class="btn btn-outline-dark btn-sm btn-edit" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-edit"></i> แก้ไข</a> 
						<a href="<?php $PHP_SELF ?>" data-href="<?php $PHP_SELF ?>?module=member_form" data-id="5" data-name="สมปอง มหาดี" role="button" class="btn btn-outline-danger btn-sm btn-delete"><i class="fa fa-trash"></i> ลบ</a></td>
					</tr> -->

                        <?php
                        $strSQL = " SELECT * FROM scheduing;";
                        $query = mysqli_query($link, $strSQL);
                        while($result = mysqli_fetch_array($query))
                        {
                            $date = date($result['PlanDate']);
                            $eng_date=strtotime("$date");
                            ?>
                           
                            <tr role="row" class="odd">
                                <td align="center" class="sorting_1"><?php echo $count++;?></td>
                                <td><a href="pages/member_edit.php?memid=<?php echo $result['id'];?>" data-id="<?php echo $result['mem_id'];?>" data-toggle="modal" data-target="#ajaxLargeModal" class="btn-edit"><?php echo $result['MntPlan']; ?></a></td>
                                <td><?php echo $result['MaintPlan_dscrptn']; ?></td>
                                <td><?php echo $result['Call_No']; ?></td>
                                <td><?php echo $result['PlanDate']; ?></td>
                                <td><?php echo $result['Mn.wk.ctr']; ?></td>
                                <td align="center">
                                    <!-- <a href="action_file.php?id=<?php echo $result['id'];?>&action=delete&table_delete=tbl_member&field_delete=id&move_page=view_member">    
									<button type="button" class="btn btn-danger"><i class="fa fa-trash-o"></i></button> </a> -->

									<!-- <a href="https://www.bahtsoft.com/demo_eqborrow/borrow/pdf/18?page=a4" role="button" class="btn btn-sm btn-outline-dark" target="_blank"><i class="fa fa-print"></i>  A4</a> -->
									<a href="pages/member_edit.php?memid=<?php echo $result['id'];?>" data-id="<?php echo $result['id']; ?>" data-name="<?php echo $result['fullname']; ?>" role="button" class="btn btn-outline-dark btn-sm btn-edit" data-toggle="modal" data-target="#ajaxLargeModal"><i class="fa fa-edit"></i> แก้ไข</a> 
									<a href="<?php $PHP_SELF ?>" data-href="<?php $PHP_SELF ?>?module=member_form" data-id="<?php echo $result['id']; ?>" data-name="<?php echo $result['fullname']; ?>" role="button" class="btn btn-outline-danger btn-sm btn-delete"><i class="fa fa-trash"></i> ลบ</a>

                                    
                                </td>
                            </tr>
                           
                        <?php } ?>
                </tbody>
                <tfoot>
                <tr>
					<!-- <th>ลำดับ</th>
					<th>ชื่อ-นามสกุล</th>
					<th>ชื่อแผนก</th>
					<th>ชื่อประเภทสมาชิก</th>
					<th>สถานะ</th>
					<th>การกระทำ</th> -->
                </tr>
                </tfoot>
              </table>
            </div>
             </div>
           <!-- /.card-body -->
          </div>


		</div>
		<!-- END container-fluid -->
	</div>
	<!-- END content -->
</div>
<!-- END content-page -->

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


	<div class="modal fade add_file" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-body">

					<!-- text input -->
					<fieldset>
						<form action="" method="post" enctype="multipart/form-data">

						<div class="col-md-9">
							<div class="form-group">
								<label for="txt_image">ไฟล์เอกสารแนบ <span style="font-weight: normal; color: #ED5565">"CSV"</span></label>
								<div class="file-loading">
								<input id="input-b7" name="input-b7[]" multiple type="file" class="file" data-allowed-file-extensions='["csv", "txt"]'>
								</div>
							</div>
						</div>

						<div class="col-md-9">
							<div class="form-group">
								<label for="txt_image">ไฟล์เอกสารแนบ <span style="font-weight: normal; color: #ED5565">"CSV"</span></label>
								<input id="input-ficons-1" type="file" class="form-control" 
									   data-show-upload="true" 
									   name="txt_file" data-validation="required"
									   data-validation-error-msg="กรุณาเลือกไฟล์ข้อมูล..." accept=".csv" required><br>
							</div>
						</div>

						<div class="col-md-3">
							<div class="form-group">
								<label for="txt_image">ปีการศึกษา</label>

								<select class="form-control" name="academic_year">

									<?php
									$strSQL4 = "SELECT * FROM `tb_academic_year` ORDER BY `tb_academic_year`.`id_academic_year` ASC ";
									$query4 = mysqli_query($link, $strSQL4);
									while ($result4 = mysqli_fetch_array($query4)) {
										?>
										<option value="<?php echo $result4['id_academic_year']; ?>"><?php echo $result4['name_academic_year']; ?></option>
									<?php } ?>
								</select>


							</div>

						</div>

						<div class="col-md-12" style="border-bottom: #e6e9ed solid 1px; padding-bottom: 15px; margin-bottom: 10px;">
							<strong> โดย : </strong><span id="font-mediumgray"><?php echo show_name(); ?></span>
							<strong>&nbsp;&nbsp; ข้อมูล ณ วันที่: </strong><span id="font-mediumgray"><?php echo datethai($date); ?></span>
						</div>

						<!-- input states -->
						<div class="box-footer">                    
							<input type="hidden" name="txt_date" value="<?php echo $date; ?>">
							<input type="hidden" name="job" value="add_file">
							<input type="hidden" name="id_project" value="<?php echo $id_project; ?>">
							<input type="hidden" name="action" value="insert">
							<input type="hidden" name="txt_category" value="<?php echo $txt_id_category; ?>">
							<button type="submit" name="submit" id="save_info"  class="btn btn-info btn-sm pull-right" >บันทึกข้อมูล
							</button>
						</div>            
						<!-- Select multiple-->

						</form>
					</fieldset>
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

<script type="text/javascript">
	$(document).on('ready', function () {
		$("#input-ficons-1").fileinput({
			allowedFileExtensions: ["csv"],
			uploadAsync: true,
			previewFileIcon: '<i class="fa fa-file"></i>',
			allowedPreviewTypes: null, // set to empty, null or false to disable preview for all types
			previewFileIconSettings: {
				'csv': '<i class="fa fa-file-excel-o text-success"></i>'

			}
		});
	});
</script>

