					<div class="input-group mb-3">
      					<div class=" input-group-prepend ">
        					<span class="btn btn-info "  style="width: 180px; text-align: right;" >Username</span>
      					</div>
      					<input type="text" class="form-control " placeholder="" id="idwkctr_user" name="idwkctr_user" value="<?php echo $result[$filed1];?>" READONLY>
    				</div>

					<div class="input-group mb-3">
      					<div class=" input-group-prepend ">
        					<span class="btn btn-info " style="width: 180px; text-align: right;" >Password</span>
      					</div>
      					<input type="text" class="form-control " placeholder="" id="<?PHP echo $filed23;?>" name="<?PHP echo $filed23;?>" value="<?php echo $result[$filed23];?>" data-toggle="tooltip" data-html="true" data-placement="top" title="รหัสผ่าน">
    				</div>
                    <input type="hidden" class="form-control " placeholder="" id="id" name="id" value="<?php echo $result[$filed1];?>" >
				