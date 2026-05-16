<?php
//ตรวจเช็คการเรียกไฟล์โดยตรง
/*
if (preg_match( "/tb_equipment.php/i",$_SERVER['PHP_SELF'])) {
    header("Location: ../");
    die();
}
*/

//$title_page = tb_equipment;
$tbl_policy = "tb_functional";
$myfile = "tb_functional";

$filed1 = "id_func"; // id คีย์หลัก
$filed2 = "functionalloc";
$filed3 = "functlocdescrip";
$filed4 = "functloccom";

include('../include/connection.php');
$strSQL = " SELECT * FROM $tbl_policy where $filed1 ='".$_REQUEST[$filed1]."';";
$query = mysqli_query($link, $strSQL);
$result = mysqli_fetch_array($query);

?>

<div id="app" class="">
	<!-- <form role="form" method="GET" >  -->
	<!-- <form role="form" method="GET" action="pages/tb_equipment_form_process.php"> -->
	<!-- <form role="form" method="GET" action="<?php $PHP_SELF ?>?module=tb_equipment">  -->
	<form role="form" method="POST" action="<?php $PHP_SELF ?>?module=<?php echo $tbl_policy;?>"> 

		<div class="modal-header">
			<h5 class="modal-title" id="exampleModalLabel">
				<span v-if="item.id == 0"><i class="fa fa-trash"></i>&nbsp;ลบข้อมูล</span>
				<!-- <span v-else>รายการข้อมูล : <?php echo $result['id_equipment'];?></span> -->				
			</h5>
			<button type="button" class="close" data-dismiss="modal" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>

		<div class="modal-body">

				<div class="form-group">
					<label for="id_equipment">
						<span class="text-secondary">id_equipment *</span>
					</label>
					<input type="text" name="id_equipment" value="<?php echo $result['id_equipment'];?>" v-model="item.id_equipment" class="form-control" autocomplete="off" maxlength="" readonly/>
				</div>
				<div class="form-group">
					<label for="equipment">
						<span class="text-secondary">equipment *</span>
					</label>
					<input type="text" name="equipment" value="<?php echo $result['equipment'];?>" v-model="item.equipment" class="form-control" autocomplete="off"  />
				</div>
				<div class="form-group">
					<label for="equipment_des">
						<span class="text-secondary">equipment_des *</span>
					</label>
					<input type="text" name="equipment_des" value="<?php echo $result['equipment_des'];?>" v-model="item.equipment_des" class="form-control" autocomplete="off"  />
				</div>
				<div class="form-group">
					<label for="equipment_com">
						<span class="text-secondary" v-if="item.id == 0">equipment_com *</span>
						<!-- <span v-else>equipment_com</span> -->
					</label>
					<input type="equipment_com" name="equipment_com" value="<?php echo $result['equipment_com'];?>" id="equipment_com" v-model="item.equipment_com" class="form-control" autocomplete="off"  />
				</div>

				<!-- <div class="form-group">
					<input type="hidden" name="op" value="save">
					<button type="submit" name="Submit" class="btn btn-success float-right"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกข้อมูล&nbsp;</button>
				</div> -->
		</div>

		<div class="modal-footer">
			<input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
			<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
			<input type="hidden" name="module" value="<?php echo $myfile; ?>">
			<input type="hidden" name="op" value="del">
			<!-- <button type="submit" class="btn btn-success" name="submit"><i class="fa fa-save nav-icon"></i>&nbsp;บันทึกข้อมูล&nbsp;</button> -->
			<button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fa fa-times nav-icon"></i>&nbsp;ยกเลิก&nbsp;</button>
			<button type="submit" name="Submit" v-on:click.prevent="submitData()" class="btn btn-danger btn-save"><i class="fa fa-trash nav-icon"></i>&nbsp;ยืนยันลบข้อมูล&nbsp;</button>
		</div>

	</form>
</div>

<!-- 
<script type="text/javascript">
var app = new Vue({
	el: '#app',
	data: {
		item: { id: $('input[name=id]').val(), usertype:'' }
	},
	methods: {
		submitData: function(){
			$('#modalForm').submit();
		}
	},
	created: function () {
		/* get data */
		axios.get(gUrl + 'api/users/' + this.item.id, {
			headers: {'api-key': gApiKey}
		}).then(
				response => {
					if (response.status === 200) {						
						if(this.item.id != 0){
							this.item = response.data;
						}
						this.item.is_active = (response.data.is_active == 1) ? true : false;
					}
				}
			);
	},
	mounted: function () {
		/* init iCheck */
		$('input').iCheck({
			checkboxClass: 'icheckbox_flat',
			radioClass: 'iradio_flat'
		});	

		var checkInterval = setInterval(function(){
			if(app.item.is_active || app.item.is_active == false){				
				if(app.item.is_active === true || app.item.id == 0){
					$('input').iCheck('check');
				}
				clearInterval(checkInterval);
			}
		},100);

		$('input').on('ifChecked', function (e) {
			app.item.is_active = true;
		});
		$('input').on('ifUnchecked', function (e) {
			app.item.is_active = false;
		});
		/* END init iCheck */
	}
});

</script>
 -->