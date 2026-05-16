<?PHP 
// Search Material 
$SQLmat = " SELECT * FROM `tbmaterial`  where wkorder = '".$row["wkorder"]."' ";
$qrMat = mysqli_query($link, $SQLmat) or die ("Error Query [".$SQLmat."]");
$numMat = mysqli_num_rows($qrMat);
//$rowsTL = mysqli_fetch_array($query);
//Search Material

?>
    <div class="row alert-dark" >
        <div class="col-sm-2" > PO </div>
        <div class="col-sm-2" > Pstng Date </div>
        <div class="col-sm-3" >Material Description </div>
        <div class="col-sm-2" >Amount LC </div>
        <div class="col-sm-1" >MvT </div> 
        <div class="col-sm-1" >Material </div> 
    </div>
    <?PHP 
if($numMat > 0  ){	    
    $i=1;
    while($rsMat = mysqli_fetch_array($qrMat)){
        if($i%2==0){
            $al = "alert-info";
        }else{
            $al = "alert-light";
        }
    ?>
    <div class="row <?PHP echo  $al;?>" >
        <div class="col-sm-2" > <?PHP  echo $rsMat["matpo"]?>  </div>   
        <div class="col-sm-2" > <?PHP  echo date("d.m.Y", $rsMat["pstngdate"]) ?>  </div>
        <div class="col-sm-3" > <?PHP  echo $rsMat["materialdesc"]?>  </div>
        <div class="col-sm-2 text-right" > <?PHP  echo $rsMat["amountinlc"]?>  </div>
        <div class="col-sm-1" > <?PHP  echo $rsMat["mvt"]?>  </div> 
        <div class="col-sm-1" > <?PHP  echo $rsMat["material"]?>  </div>         
    </div>
    <?PHP 
        $i++; 
    } // end while
} else{    
?>
    <div class="row"> 
        <div class="col"> ไม่พบข้อมูล</div>
    </div>
<?PHP 
} // end if        
?>