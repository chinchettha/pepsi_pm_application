<div class="container-fluid">
	<h1 class="mt-4"><?php echo $_REQUEST['module']?></h1>
	<ol class="breadcrumb mb-4">
		<li class="breadcrumb-item"><a href="index.php">Dashboard</a></li>
		<li class="breadcrumb-item active"><?php echo $_REQUEST['module']?></li>
	</ol>
	<div class="card mb-4">
		<div class="card-body">การเตรียมไฟล์ข้อมูล
		<ol>
			<li>xxxx</li>
			<li>bbbb</li>
			<li>cccccccccc</li>
		</ol><a href="">ดาวน์โหลดตัวอย่างไฟล์การนำเข้า</a>
		</div>
	</div>
	<div class="card-header">
		<!-- <form method="POST" action="tb_equipment_import_process.php" enctype="multipart/form-data"> -->
		<form method="POST" action="<?php $PHP_SELF ?>index.php?module=tb_equipment_import_process" enctype="multipart/form-data">
			<div class="form-group">
				<label>Upload Excel File</label>
				<input type="file" name="file" class="form-control" accept=".xls">
			</div>
			<div class="form-group">
				<button type="submit" name="Submit" class="btn btn-success">Upload</button>
			</div>
		</form>
	</div>
</div>

