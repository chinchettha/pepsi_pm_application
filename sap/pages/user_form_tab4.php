<form role="form" method="POST" action="<?php $PHP_SELF ?>?module=<?php echo $myfile;?>"> 

					<div class="input-group mb-3">
      					<div class=" input-group-prepend ">
        					<span class="btn btn-info "  style="width: 180px; text-align: right;" >Username <i class="fa fa-user"></i></span>
      					</div>
      					<input type="text" class="form-control " placeholder="" id="Username" name="Username" value="<?php echo $result['wkctr'];?>" READONLY>
    				</div>

					<div class="input-group mb-3">
      					<div class=" input-group-prepend ">
        					<span class="btn btn-info " style="width: 180px; text-align: right;" >Password <i class="fa fa-key"></i></span>
      					</div>
      					<input type="text" class="form-control " placeholder="" id="Password" name="Password" value="<?php echo $result['Password'];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="รหัสผ่าน">
    				</div>

					<!-- <div class="input-group mb-3">
						<div class=" input-group-prepend ">
							<span class="btn btn-info " style="width: 180px; text-align: right;" >Password New</span>
						</div>
						<input type="text" class="form-control " placeholder="" id="PasswordNew" name="PasswordNew" data-toggle="tooltip" data-html="true" data-placement="top" title="รหัสผ่านใหม่">
					</div> -->

	<div class="modal-footer">
		<input type="hidden" name="mem_id" value="<?php echo $_SESSION["mem_id"]; ?>">
		<input type="hidden" name="username" value="<?php echo $_SESSION["username"]; ?>">
		<input type="hidden" name="module" value="<?php echo $myfile; ?>">
		<button type="button" class="btn btn-secondary" data-dismiss="modal"><i class="fa fa-times nav-icon"></i>&nbsp;ยกเลิก&nbsp;</button>
		<?php if ($_REQUEST['op']=="edit"){
			echo "<input type='hidden' name='op' value='save'>";
			echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-primary btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;แก้ไขข้อมูล&nbsp;</button>";
		}elseif ($_REQUEST['op']=="del"){
			echo "<input type='hidden' name='op' value='del'>";
			echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-warning btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;ลบข้อมูล&nbsp;</button>";
		}else{
			echo "<input type='hidden' name='op' value='save'>";
			echo "<button type='submit' name='Submit' v-on:click.prevent='submitData()' class='btn btn-primary btn-save'><i class='fa fa-save nav-icon'></i>&nbsp;เพิ่มข้อมูล&nbsp;</button>";
		}
		?>
	</div>
</form>
