package com.taskmanagement.backend.controller;

import com.taskmanagement.backend.dto.CardResponse;
import com.taskmanagement.backend.dto.CreateCardRequest;
import com.taskmanagement.backend.dto.MoveCardRequest;
import com.taskmanagement.backend.service.CardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping
    public List<CardResponse> getCards(@RequestParam(required = false) UUID listId) {
        if (listId != null) {
            return cardService.getCardsByListId(listId);
        }
        return cardService.getAllCards();
    }

    @GetMapping("/{id}")
    public CardResponse getCard(@PathVariable UUID id) {
        return cardService.getCardById(id);
    }

    @PostMapping
    public ResponseEntity<CardResponse> createCard(@RequestBody CreateCardRequest request) {
        CardResponse created = cardService.createCard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/position")
    public List<CardResponse> moveCard(@PathVariable UUID id, @RequestBody MoveCardRequest request) {
        return cardService.moveCard(id, request);
    }
}
