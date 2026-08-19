package com.taskmanagement.backend.repository;

import com.taskmanagement.backend.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
}
