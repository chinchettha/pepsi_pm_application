    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" crossorigin="anonymous">
    <link href="plugins/fileinput/css/fileinput.css" media="all" rel="stylesheet" type="text/css"/>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" crossorigin="anonymous">
    <link href="plugins/fileinput/themes/explorer-fas/theme.css" media="all" rel="stylesheet" type="text/css"/>
    <script src="https://code.jquery.com/jquery-3.3.1.min.js" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <script src="plugins/fileinput/js/plugins/piexif.js" type="text/javascript"></script>
    <script src="plugins/fileinput/js/plugins/sortable.js" type="text/javascript"></script>
    <script src="plugins/fileinput/js/fileinput.js" type="text/javascript"></script>
    <script src="plugins/fileinput/js/locales/fr.js" type="text/javascript"></script>
    <script src="plugins/fileinput/js/locales/es.js" type="text/javascript"></script>
    <script src="plugins/fileinput/themes/fas/theme.js" type="text/javascript"></script>
    <script src="plugins/fileinput/themes/explorer-fas/theme.js" type="text/javascript"></script>


<div class="card-body">


	<form name="frmMain" id="frmMain" method="POST" action="<?php $PHP_SELF ?>?module=W_confirm_form&op=edit&idplanw=<?php echo $_SESSION['idplanw'];?>&idiw37=<?php echo $_SESSION['idiw37'];?>&wkorder=<?php echo $_SESSION['wkorder'];?>" enctype="multipart/form-data" onsubmit="return chk();">
	<input type="hidden" name="op" value="insert_img">

	  <div class="form-group">
		<label for="customFile"><i class="fa fa-camera"></i>&nbsp;<i class="far fa-image"></i>&nbsp;แทรกภาพถ่ายจากอุปกรณ์</label>
		<div class="custom-file">

		  <!-- <input type="file" class="custom-file-input" id="customFile">
		  <label class="custom-file-label" for="customFile">Choose file</label> -->


			<!-- แบบที่ 1 -->

				<!-- <input id="input-1" type="file" name="fileUpload" class="" data-show-upload="true" accept=".jpg ,.jpeg ,.png ,.gif" > -->
				<input type="file" id="fileUpload2" name="fileUpload2" class="form-control" accept=".jpg,.jpeg" data-browse-on-zone-click="true">

				<script>
				$(document).ready(function() {
					$("#fileUpload2").fileinput({
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
