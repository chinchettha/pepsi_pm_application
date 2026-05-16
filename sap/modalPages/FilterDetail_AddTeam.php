<?PHP
//$numLM = 2500; //จำกัดจำนวนรายการที่แสดง
if(!empty($_POST["Event"][1]) && !empty($_POST["Event"][2])){
    $keyword = $TxtSearch;
}else{    
    $keyword = $TxtKeyword;
}



?>

<div class="row"  > 
<div class="col-sm alert-success"  > TeamA (No.)  </div>
<div class="col-sm" style="text-align: right;"  >
<?PHP  
    $sqlTA = "SELECT count(team) as TeamA FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')    and team = 'A'  $keyword limit 0,1000 ";
    $qrTA = mysqli_query($link, $sqlTA) or die ("Error Query [".$sqlTA."]");
    $rsTA = mysqli_fetch_array($qrTA);
    echo $rsTA["TeamA"];       
?>            
</div>
</div>
<div class="row"> 
<div class="col"> Work (Min) </div>
<div class="col alert-success" style="text-align: right;" > 
<?PHP  
    $sqlSA = "SELECT sum(work)  as WorkA FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and team = 'A'  $keyword limit 0,1000 ";
    $qrSA = mysqli_query($link, $sqlSA) or die ("Error Query [".$sqlSA."]");
    $rsSA = mysqli_fetch_array($qrSA);
    echo $rsSA["WorkA"];       
?>
</div>
</div>
<div class="row" > 
<div class="col alert-danger"> TeamB (No.) </div>
<div class="col " style="text-align: right;"> 
<?PHP  
    $sqlTB = "SELECT count(team) as TeamB FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and team = 'B'  $keyword limit 0,1000";
    $qrTB = mysqli_query($link, $sqlTB) or die ("Error Query [".$sqlTB."]");
    $rsTB = mysqli_fetch_array($qrTB);
    echo $rsTB["TeamB"];
?>
</div>
</div>
<div class="row"> 
<div class="col">  Work (Min)  </div>
<div class="col alert-danger" style="text-align: right;" >
<?PHP  
    $sqlSB = "SELECT sum(work)  as WorkB FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and team = 'B'  $keyword limit 0,1000 ";
    $qrSB = mysqli_query($link, $sqlSB) or die ("Error Query [".$sqlSB."]");
    $rsSB = mysqli_fetch_array($qrSB);
    echo $rsSB["WorkB"];       
?>
</div>
</div>

<!------ Updte 170963 ---->
<div class="row" > 
<div class="col alert-danger"> TeamP (No.) </div>
<div class="col " style="text-align: right;"> 
<?PHP  
    $sqlTP = "SELECT count(team) as TeamP FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and team = 'P'  $keyword limit 0,1000 ";
    $qrTP = mysqli_query($link, $sqlTP) or die ("Error Query [".$sqlTP."]");
    $rsTP = mysqli_fetch_array($qrTP);
    echo $rsTP["TeamP"];
?>
</div>
</div>
<div class="row"> 
<div class="col">  Work (Min)  </div>
<div class="col alert-danger" style="text-align: right;" >
<?PHP  
    $sqlSP = "SELECT sum(work)  as WorkP FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and team = 'P'  $keyword limit 0,1000 ";
    $qrSP = mysqli_query($link, $sqlSP) or die ("Error Query [".$sqlSP."]");
    $rsSP = mysqli_fetch_array($qrSP);
    echo $rsSP["WorkP"];       
?>
</div>
</div>
<!------ Updte 170963 ---->

</div>

</div>

<script>
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})
</script>