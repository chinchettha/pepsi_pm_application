<?PHP
$numLM = 2000; //จำกัดจำนวนรายการที่แสดง
if(!empty($_POST["Event"][1]) && !empty($_POST["Event"][2])){
    $keyword = $TxtSearch;
}else{    
    $keyword = $TxtKeyword;
}

//หาจำนวน ZB แต่ละรายการ

     //หา ZB
    $sqlZB = " SELECT wkzb from tbwkzb  ";
    $qrZB = mysqli_query($link, $sqlZB) or die ("Error Query [".$sqlZB."]");
    $numZB = mysqli_num_rows($qrZB);
    $ZB = "";
    while($rowZB = mysqli_fetch_array($qrZB)){
       $ShowZB .= "&nbsp; ". $rowZB["wkzb"] . "=";

        $sqlZBc = " SELECT idiw37 from $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')  and wktype = '".$rowZB["wkzb"]."' ". $keyword ."  limit 0,$numLM ";
        $qrZBc = mysqli_query($link, $sqlZBc) or die ("Error Query [".$sqlZBc."]");
        $numZBc = mysqli_num_rows($qrZBc);
       $ShowZB .= $numZBc;
       $ShowZB .= "&nbsp; ";
    } 
        $ZB .= $ShowZB; 
    //หา ZB
//หาจำนวน ZB แต่ละรายการ    

?>


<div class="row" >
<div class="col alert-warning" title="<?PHP  echo $ZB ;?>" data-toggle="tooltip" data-html="true" > 
    WorkOrder
</div>
<div class="col" style="text-align: right;" >  
    <?PHP  echo $num; ?>
</div>
</div>
<div class="row">
<?PHP  //หาจำนงานที่ทำเสร็จแล้วทั้งหมด ***********************
    

    $sqlCP = "SELECT idiw37 FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and syst NOT IN ('CRTD', 'REL')  $keyword  limit 0,$numLM ";
    $qrCP = mysqli_query($link, $sqlCP) or die ("Error Query [".$sqlCP."]");
    $numCP = mysqli_num_rows($qrCP);  
    $percent = ( $numCP /$num )*100;
    $pt = number_format( $percent , 0 );
?>
<div class="col-sm  " >completion   </div>            
<div class="col-sm alert-primary "  style="text-align: right;"  > <?PHP  echo $numCP;?>  </div>  
</div>
<div class=" row">  
<div class="col">      
<div class="progress  ">
    <div class="progress-bar"  role="progressbar" aria-valuenow="<?PHP  echo $pt;?>"  aria-valuemin="0" aria-valuemax="100" style="width:<?PHP  echo $pt;?>%"> <?PHP   echo  $pt ;?> % </div>
</div>
</div> 
</div>  

<div class="row"  > 
<div class="col-sm alert-success"  > TeamA (No.)  </div>
<div class="col-sm" style="text-align: right;"  >
<?PHP  
    $sqlTA = "SELECT count(team) as TeamA FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')    and team = 'A'  $keyword  limit 0,$numLM ";
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
    $sqlSA = "SELECT sum(work)  as WorkA FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and team = 'A'  $keyword  limit 0,$numLM ";
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
    $sqlTB = "SELECT count(team) as TeamB FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and team = 'B'  $keyword  limit 0,$numLM ";
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
    $sqlSB = "SELECT sum(work)  as WorkB FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and team = 'B'  $keyword  limit 0,$numLM ";
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
    $sqlTP = "SELECT count(team) as TeamP FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and team = 'P'  $keyword   limit 0,$numLM ";
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
    $sqlSP = "SELECT sum(work)  as WorkP FROM $tbl_policy where ( `functionalloc`  like '%".$Factory_code."%')   and team = 'P'  $keyword  limit 0,$numLM ";
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