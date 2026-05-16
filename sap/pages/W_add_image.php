<?php
session_start();

//include('../include/connection.php');
//$strSQL = " SELECT * FROM tbl_member where id ='".$_SESSION['mem_id']."';";
//$query = mysqli_query($link, $strSQL);
//$result = mysqli_fetch_array($query)

//$title_page = tb_user_workorder;
$tbl_policy = "tb_workorder_image";
$myfile = "confirm_form";


?>



<!-- นำเข้า  CSS จาก fileinput -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" crossorigin="anonymous">
    <link href="../plugins/fileinput/css/fileinput.css" media="all" rel="stylesheet" type="text/css"/>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" crossorigin="anonymous">
    <link href="../plugins/fileinput/themes/explorer-fas/theme.css" media="all" rel="stylesheet" type="text/css"/>
    <script src="https://code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="../plugins/fileinput/js/plugins/piexif.js" type="text/javascript"></script>
    <script src="../plugins/fileinput/js/plugins/sortable.js" type="text/javascript"></script>
    <script src="../plugins/fileinput/js/fileinput.js" type="text/javascript"></script>
    <script src="../plugins/fileinput/js/locales/fr.js" type="text/javascript"></script>
    <script src="../plugins/fileinput/js/locales/es.js" type="text/javascript"></script>
    <script src="../plugins/fileinput/themes/fas/theme.js" type="text/javascript"></script>
    <script src="../plugins/fileinput/themes/explorer-fas/theme.js" type="text/javascript"></script>
<!-- นำเข้า  CSS จาก fileinput -->

<!-- นำเข้า  CSS จาก fileinput -->
<!-- <link rel="stylesheet" href="css/fileinput.min.css?v=1001"> -->
<!-- <script type="text/javascript" src="js/fileinput.min.js?v=1001"></script> -->
<!-- <link href="../plugins/fileinput/css/fileinput.min.css?ver=201904201807" rel="stylesheet">
<link href="../plugins/fileinput/css/fileinput-rtl.min.css?ver=201904201807" rel="stylesheet">
<script src="../plugins/fileinput/js/fileinput.min.js?ver=201904201807"></script> -->

<link href="../plugins/fileinput2/css/fileinput.min.css" media="all" rel="stylesheet" type="text/css"/>
<script src="../plugins/fileinput2/js/fileinput.min.js" type="text/javascript"></script>

<link href="../plugins/fileinput2/css/bootstrap-fileinput.css" media="all" rel="stylesheet" type="text/css"/>
<script src="../plugins/fileinput2/js/bootstrap-fileinput.js" type="text/javascript"></script>


<div id="app" class="">

	<!-- <form action="<?php $PHP_SELF ?>?module=member_form_process" role="form" id="modalForm" method="post" enctype="multipart/form-data" name="Submit"> -->
<!-- <FORM NAME="myform" ACTION="web_news_add_cover_process.php" METHOD="post" enctype="multipart/form-data" runat="server"> -->
	<!-- <FORM NAME="myform" ACTION="pages/add_image_upload.php" METHOD="post" enctype="multipart/form-data" runat="server"> -->
	<form action="<?php $PHP_SELF ?>?module=W_add_image_upload" role="form" id="modalForm" method="post" enctype="multipart/form-data" name="Submit" runat="server">
		<input type="hidden" name="op" value="insert_img">

		<div class="modal-header">
			<h5 class="modal-title" id="exampleModalLabel">
				<span v-else>แทรกรูปภาพ : <?php echo $result['fullname'];?></span>				
			</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
		<div class="modal-body">

		<!-- <form action="add_image_upload.php" method="post" enctype="multipart/form-data">
			Select image to upload:
			<input type="file" name="fileToUpload" id="fileToUpload" accept=".jpg, .jpeg, .png, .gif">
			<input type="submit" value="Upload Image" name="submit">
		</form> -->
	
		<!-- <table width="100%">
			<tr bgcolor="#F6F6F6">
				<td align="right">Select Image</td>
				<td align="left">
				<img id="blah" src="#" alt="your image" title="your image" width='120'/><BR>
					<input type="file" name="fileToUpload" onpropertychange="view01.src=FILE.value;" style="width:80%;" onchange="readURL(this);" required accept=".jpg, .jpeg, .png, .gif">
					<br><font size="" color="RED">สนับสนุนไฟล์นามสกุล .jpg,.png,.gif เท่านั้น</font>
				</td>
			</tr>
		</table> -->

			<!-- <div class="file-loading">
				<input id="fileToUpload" name="fileToUpload[]" type="file" multiple>
			</div>
			<script>
			// initialize with defaults
			$("#fileToUpload").fileinput();
			 
			// with plugin options
			$("#fileToUpload").fileinput({'showUpload':false, 'previewFileType':'any'});

			$(document).ready(function() {
				$("#fileToUpload").fileinput({
					maxFileCount: 10,
					allowedFileExtensions: ["jpg", "jpeg", "gif", "png"]
				});
			});
			</script>
<hr> -->

                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="txt_image">Select Image <span id="font-grapefruit" style="font-weight: normal; color: #ED5565">"jpg", "png", "gif"</span></label>
                            <input id="input-21" type="file"  class="" data-show-upload="true" name="txt_image" accept=".jpg ,.jpeg ,.png ,.gif" required>
                            <!-- <input id="input-21" type="file"  class="" data-show-upload="true" name="txt_image[]" accept=".jpg ,.jpeg ,.png ,.gif" multiple> -->
                            <?php if (!$result['new_thumbnail'] == '') { ?>
                                <img src="images/<?php echo $result['new_thumbnail']; ?>">
                            <?php } ?>
                        </div>
                    </div>
                    <!-- <div class="col-md-6">
                        <div class="form-group">
                            <label for="txt_file">ไฟล์เอกสารแนบ <span style="font-weight: normal; color: #ED5565">"docx", "xlsx", "pptx", "doc", "xls", "ppt", "pdf"</span></label>
                            <input id="input-ficons-1" type="file" class="" data-show-upload="true" name="txt_file" accept=".docx , .xlsx ,.pptx ,.doc ,.xls ,.ppt ,.pdf"><br>
                            <?php if (!$result['new_file'] == '') { ?>
                                <div class="well"><?php echo $result['new_file']; ?></div>
                            <?php } ?>
                        </div>
                    </div>
 -->
			<!-- 
			$name = $_FILES['field-name']['name'];
			$size = $_FILES['field-name']['size'];
			if you print the file name option you'll there are multiple option you have to select
			print_r($_FILES['you-filed-name-here']);
			 -->

		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-secondary" data-dismiss="modal">				ปิด</button>
			<button type="submit" name="Submit" id="submit" v-on:click.prevent="submitData()" class="btn btn-primary btn-save"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึก</button>
		</div>
	</form>

</div>


<script type="text/javascript">
    $(document).on('ready', function () {
        $("#input-21").fileinput({
            allowedFileExtensions: ["jpg", "jpeg", "png", "gif"],
            previewFileType: "image",
            browseClass: "btn btn-success",
            browseLabel: "Pick Image",
            browseIcon: "<i class=\"glyphicon glyphicon-picture\"></i> ",
            removeClass: "btn btn-danger",
            removeLabel: "Delete",
            removeIcon: "<i class=\"glyphicon glyphicon-trash\"></i> ",
            uploadClass: "btn btn-info",
            uploadLabel: "Upload",
            uploadIcon: "<i class=\"glyphicon glyphicon-upload\"></i> "
        });
        $("#input-ficons-1").fileinput({
            allowedFileExtensions: ["docx", "xlsx", "pptx", "doc", "xls", "ppt", "pdf"],
            uploadAsync: true,
            previewFileIcon: '<i class="fa fa-file"></i>',
            allowedPreviewTypes: null, // set to empty, null or false to disable preview for all types
            previewFileIconSettings: {
                'doc': '<i class="fa fa-file-word-o text-primary"></i>',
                'docx': '<i class="fa fa-file-word-o text-primary"></i>',
                'xls': '<i class="fa fa-file-excel-o text-success"></i>',
                'xlsx': '<i class="fa fa-file-excel-o text-success"></i>',
                'ppt': '<i class="fa fa-file-powerpoint-o text-danger"></i>',
                'pptx': '<i class="fa fa-file-powerpoint-o text-danger"></i>',
                'pdf': '<i class="fa fa-file-pdf-o text-danger"></i>',
            }
        });
    });
</script>

