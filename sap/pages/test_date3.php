<div class="input-group mb-3">
  <div class="input-group-prepend">
    <span class="btn btn-info" style="width: 180px; text-align: right;">วันที่เริ่มงาน</span>
  </div>
	<span style="position: relative;display: inline-block;border: 1px solid #a9a9a9;height: 42px;">
		<input type="date" class="xDateContainer" onchange="setCorrect(this,'xTime2');" style="position: absolute; opacity: 0.0;height: 100%;width: 100%;">
		<!-- <input type="text" id="xTime2" name="xTime2" value="dd.mm.yyyy" style="border: none;height: 90%;" tabindex="-1"> -->
		<input type="text" id="xTime2" name="xTime2" value="<?php date("d.m.Y", $result['startwork']);?>" style="border: none;height: 90%;" tabindex="-1">
		<span style="display: inline-block;width: 20px;z-index: 2;float: right;padding-top: 3px;" tabindex="-1">&#9660;</span>
	</span>
	<script language="javascript">
	var matchEnterdDate=0;
	//function to set back date opacity for non supported browsers
		window.onload =function(){
			var input = document.createElement('input');
			input.setAttribute('type','date');
			input.setAttribute('value', 'some text'); 
			if(input.value === "some text"){
				allDates = document.getElementsByClassName("xDateContainer");
				matchEnterdDate=1;
				for (var i = 0; i < allDates.length; i++) {
					allDates[i].style.opacity = "1";
				} 
			}
		}
	//function to convert enterd date to any format
	function setCorrect(xObj,xTraget){
		var date = new Date(xObj.value);
		var month = date.getMonth()+1;
		var day = date.getDate();
		var year = date.getFullYear();
		if(month!='NaN'){
			document.getElementById(xTraget).value=day+"."+month+"."+year;
		}else{
			//if(matchEnterdDate==1){document.getElementById(xTraget).value=xObj.value;}
			if(matchEnterdDate==1){document.getElementById(xTraget).value=<?php date("d.m.Y", $result['startwork']);?>;}
		}
	}
	   </script>
</div>
