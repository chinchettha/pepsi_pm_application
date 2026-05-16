<?php
try
{
	$bdd = new PDO('mysql:host=localhost;dbname=lay;charset=utf8', 'root', 'WebLib01');
}
catch(Exception $e)
{
        die('Erreur : '.$e->getMessage());
}
