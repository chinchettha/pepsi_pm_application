                    <div class="sb-sidenav-menu">
                        <div class="nav">
                        <?PHP
                            $sqlMenu = "SELECT * FROM tbmenu where idmenusub='0'  order by menuon  ;";
                            $qrMenu = mysqli_query($link, $sqlMenu) or die ("Error Query [".$sqlMenu."]") ;
                            //echo $strSQL;
                            while($rsMenu = mysqli_fetch_array($qrMenu)){ //หาเมนูหลัก
                                //หาสิทธิ์การใช้งาน
                                if(!empty($rsMenu["menuright"])){
                                    $Fright = explode(":",$rsMenu["menuright"]);
                                }                                
                                $c = count($Fright); // นับจำนวน array
                                for($i=0;$i<$c;$i++){
                                   // echo $Fright[$i]."i=".$i."c=".$c;
                                    if($Fright[$i] == $_SESSION['UserST'] ){
                                    ?>
                                     <div class="sb-sidenav-menu-heading"><i class=" <?PHP echo "fas ". $rsMenu["menuicon"] ?>"></i> &nbsp; <?PHP echo $rsMenu["menutitle"];?></div>
                                    <?PHP
                                    } // if($_SESSION['UserST']== $right[$i] ){
                                } // for($i=0;$i<=$c;$i++){
                                //หาสิทธิ์การใช้งาน   
                                $sqlMenu1 = "SELECT * FROM tbmenu where idmenusub='$rsMenu[idmenu]'  order by menuon  ;";
                                $qrMenu1 = mysqli_query($link, $sqlMenu1) or die ("Error Query [".$sqlMenu1."]") ;
                                //echo $strSQL;
                                while($rsMenu1 = mysqli_fetch_array($qrMenu1)){ //หาเมนูย่อย 1
                                  //หาสิทธิ์การใช้งาน
                                  if(!empty($rsMenu1["menuright"])){
                                    $Fright = explode(":",$rsMenu1["menuright"]);
                                    }                                     
                                  $c = count($Fright); // นับจำนวน array
                                  for($i=0;$i<$c;$i++){
                                    if($_SESSION['UserST'] == $Fright[$i] ){
                                    if($rsMenu1["menulavel"]==1 ){ //หาว่ามีเมนูย่อยอีกหรือป่าว
                                    ?>
                                        <a class="nav-link " href="<?php echo $rsMenu1["menulink"];  ?>"  >
                                        <div class="sb-nav-link-icon"><i class=" <?PHP echo "fas ". $rsMenu1["menuicon"] ?>"></i></div>
                                        &nbsp;<?PHP echo $rsMenu1["menutitle"]; ?> </a>
                                    <?PHP 
                                    }else {
                                        ?>
                                    <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#<?PHP echo $rsMenu1["menuname"]; ?>" aria-expanded="false" aria-controls="collapseLayouts" >
                                    <div class="sb-nav-link-icon"><i class=" <?PHP echo "fas ".  $rsMenu1["menuicon"] ?>"></i></div>
                                    &nbsp;<?PHP echo $rsMenu1["menutitle"]; ?>
                                    <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div></a>
                                    <div class="collapse" id="<?PHP echo $rsMenu1["menuname"]; ?>" aria-labelledby="headingOne" data-parent="#sidenavAccordion">
                                        <nav class="sb-sidenav-menu-nested nav">
                                <?PHP 
                                    $sqlMenu2 = "SELECT * FROM tbmenu where idmenusub='$rsMenu1[idmenu]'  order by menuon  ;";
                                    $qrMenu2 = mysqli_query($link, $sqlMenu2) or die ("Error Query [".$sqlMenu2."]") ;
                                    //echo $strSQL;
                                    while($rsMenu2 = mysqli_fetch_array($qrMenu2)){ //หาเมนูย่อย 2
                                        //หาสิทธิ์การใช้งาน
                                        if(!empty($rsMenu2["menuright"])){
                                            $Fright = explode(":",$rsMenu2["menuright"]);
                                        }                                         
                                        $c = count($Fright); // นับจำนวน array
                                        for($i=0;$i<$c;$i++){
                                        if($_SESSION['UserST'] == $Fright[$i] ){
                                    ?>
                                        <a class="nav-link " href="<?php echo $rsMenu2["menulink"]; ?>"  >
                                        <div class="sb-nav-link-icon"><i class=" <?PHP echo "fas ". $rsMenu2["menuicon"] ?>"></i></div>
                                        &nbsp;<?PHP echo $rsMenu2["menutitle"]; ?> </a>
                                    <?PHP 
                                        } // if($_SESSION['UserST']== $right[$i] ){
                                        } // for($i=0;$i<=$c;$i++){
                                    } // while($rsMenu2 = mysqli_fetch_array($qrMenu2)){ //หาเมนูย่อย 2
                                    ?>
                                        </nav>
                                    </div>

                                    <?PHP 
                                    } //  if($rsMenu1["menulevel"]==1 ){ //หาว่ามีเมนูย่อยอีกหรือป่าว
                                    } // if($_SESSION['UserST']== $right[$i] ){
                                    } // for($i=0;$i<=$c;$i++){    
                                } // while($rsMenu1 = mysqli_fetch_array($qrMenu1)){ //หาเมนูย่อย 1
                            } // while($rsMenu = mysqli_fetch_array($qrMenu)){ //หาเมนูหลัก
                        ?>


                        </div>
                    </div>

<div class="sb-sidenav-footer">
	<?php
	if ($_SESSION['username']==""){
	?>
	<div class="small"><a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=login"
	><i class="fas fa-lock"></i>&nbsp;เข้าสู่ระบบ</a></div>
	<?php }else{?>
	<div class="small">Logged in as : <?php echo $_SESSION['username'];?></div>
	<a class="nav-link" href="<?php $PHP_SELF ?>index2.php?module=logout"
	><i class="fas fa-unlock" style="color:red"></i>&nbsp;ออกระบบ</a>
	<?php }?>
</div>